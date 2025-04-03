
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { SongRequest, DrinkOrder, User, SecurityReport } from '../common/types';

// In-memory data store for our application state
const appState = {
  songRequests: [] as SongRequest[],
  drinkOrders: [] as DrinkOrder[],
  users: new Map<string, User>(),
  securityReports: [] as SecurityReport[]
};

// Create HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Club App WebSocket Server\n');
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send current state to new clients
  ws.send(JSON.stringify({
    type: 'state:init',
    data: {
      songRequests: appState.songRequests,
      drinkOrders: appState.drinkOrders,
      securityReports: appState.securityReports
    }
  }));

  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const { type, data } = JSON.parse(message.toString());
      console.log(`Received message: ${type}`, data);

      // Handle different message types
      switch (type) {
        case 'user:login':
          handleUserLogin(data);
          break;
        case 'song:request':
          handleSongRequest(data);
          break;
        case 'song:update-tip':
          handleUpdateSongTip(data);
          break;
        case 'song:play':
          handlePlaySong(data);
          break;
        case 'song:reject':
          handleRejectSong(data);
          break;
        case 'drink:order':
          handleDrinkOrder(data);
          break;
        case 'drink:serve':
          handleDrinkServe(data);
          break;
        case 'drink:reject':
          handleDrinkReject(data);
          break;
        case 'security:report':
          handleSecurityReport(data);
          break;
        default:
          console.log(`Unhandled message type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Message handlers
function handleUserLogin(data: User) {
  appState.users.set(data.id, data);
  broadcastToAll('user:login', data);
  
  // Send current state to the user based on role
  if (data.role === 'patron') {
    // Find patron's current requests
    const patronSongRequests = appState.songRequests.filter(r => r.patronId === data.id);
    if (patronSongRequests.length > 0) {
      broadcastToAll(`patron:${data.id}:requests`, patronSongRequests);
    }
    
    // Send queue to show position
    broadcastToAll('song:queue', appState.songRequests);
  } else if (data.role === 'dj') {
    // Send song queue
    broadcastToAll('song:queue', appState.songRequests);
  } else if (data.role === 'bartender') {
    // Send drink orders
    broadcastToAll('drink:orders', appState.drinkOrders);
  } else if (data.role === 'security') {
    // Send security reports
    broadcastToAll('security:reports', appState.securityReports);
  }
}

function handleSongRequest(data: SongRequest) {
  // Check if the same song is already requested
  const existingRequest = appState.songRequests.find(
    r => r.song.id === data.song.id && r.status === 'pending'
  );

  if (existingRequest) {
    // Update the existing request by adding the tip amount
    existingRequest.tipAmount += data.tipAmount;
    
    // Add the patron to contributors list if we're tracking multiple patrons
    if (!existingRequest.contributorIds) {
      existingRequest.contributorIds = [existingRequest.patronId];
    }
    existingRequest.contributorIds.push(data.patronId);
    
    // Notify the patron that their request was added to an existing one
    broadcastToAll(`patron:${data.patronId}:song-combined`, {
      songId: data.song.id,
      combinedRequestId: existingRequest.id
    });
  } else {
    // Create a new request
    const request: SongRequest = {
      ...data,
      status: 'pending' as const,
      timestamp: Date.now(),
      id: `sr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contributorIds: [data.patronId]
    };
    
    appState.songRequests.push(request);
  }
  
  updateSongQueue();
  broadcastToAll('song:queue', appState.songRequests);
}

function handleUpdateSongTip(data: { requestId: string; newTipAmount: number }) {
  const request = appState.songRequests.find(r => r.id === data.requestId);
  if (request) {
    request.tipAmount = data.newTipAmount;
    updateSongQueue();
    broadcastToAll('song:queue', appState.songRequests);
  }
}

function handlePlaySong(data: { requestId: string }) {
  const request = appState.songRequests.find(r => r.id === data.requestId);
  if (request) {
    request.status = 'playing';
    
    // Add tip to DJ's balance
    const dj = Array.from(appState.users.values()).find(u => u.role === 'dj');
    if (dj && dj.balance !== undefined) {
      dj.balance += request.tipAmount;
      broadcastToAll('dj:update', dj);
    }
    
    // Notify all patrons who contributed
    if (request.contributorIds) {
      request.contributorIds.forEach(patronId => {
        broadcastToAll(`patron:${patronId}:song-played`, request);
      });
    } else {
      // Backward compatibility
      broadcastToAll(`patron:${request.patronId}:song-played`, request);
    }
    
    // After a delay, mark as played and remove from queue
    setTimeout(() => {
      request.status = 'played';
      appState.songRequests = appState.songRequests.filter(r => r.id !== data.requestId);
      updateSongQueue();
      broadcastToAll('song:queue', appState.songRequests);
    }, 5000); // Simulate song duration
  }
}

function handleRejectSong(data: { requestId: string }) {
  const request = appState.songRequests.find(r => r.id === data.requestId);
  if (request) {
    request.status = 'rejected';
    
    // Notify all patrons who contributed
    if (request.contributorIds) {
      request.contributorIds.forEach(patronId => {
        broadcastToAll(`patron:${patronId}:song-rejected`, request);
      });
    } else {
      // Backward compatibility
      broadcastToAll(`patron:${request.patronId}:song-rejected`, request);
    }
    
    // Remove from queue
    appState.songRequests = appState.songRequests.filter(r => r.id !== data.requestId);
    updateSongQueue();
    broadcastToAll('song:queue', appState.songRequests);
  }
}

function handleDrinkOrder(data: DrinkOrder) {
  const order: DrinkOrder = {
    ...data,
    status: 'pending' as const,
    timestamp: Date.now(),
    id: `do-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  appState.drinkOrders.push(order);
  broadcastToAll('drink:orders', appState.drinkOrders);
}

function handleDrinkServe(data: { orderId: string }) {
  const order = appState.drinkOrders.find(o => o.id === data.orderId);
  if (order) {
    order.status = 'delivered';
    
    // Notify patron
    broadcastToAll(`patron:${order.patronId}:drink-served`, order);
    
    // Remove from orders after a delay
    setTimeout(() => {
      appState.drinkOrders = appState.drinkOrders.filter(o => o.id !== data.orderId || o.status !== 'delivered');
      broadcastToAll('drink:orders', appState.drinkOrders);
    }, 60000);
  }
}

function handleDrinkReject(data: { orderId: string }) {
  const order = appState.drinkOrders.find(o => o.id === data.orderId);
  if (order) {
    order.status = 'rejected';
    
    // Notify patron
    broadcastToAll(`patron:${order.patronId}:drink-rejected`, order);
    
    // Remove from orders
    appState.drinkOrders = appState.drinkOrders.filter(o => o.id !== data.orderId);
    broadcastToAll('drink:orders', appState.drinkOrders);
  }
}

function handleSecurityReport(data: SecurityReport) {
  const report: SecurityReport = {
    ...data,
    id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    status: 'submitted' as const
  };
  
  appState.securityReports.push(report);
  broadcastToAll('security:reports', appState.securityReports);
}

function updateSongQueue() {
  // Sort by tip amount and assign queue positions
  appState.songRequests
    .filter(r => r.status === 'pending')
    .sort((a, b) => b.tipAmount - a.tipAmount)
    .forEach((request, index) => {
      request.queuePosition = index + 1;
    });
}

// Broadcast message to all connected clients
function broadcastToAll(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
