
import { useEffect, useRef, useState, useCallback } from 'react';
import { SongRequest, DrinkOrder, User } from '../common/types';

// React hook to use WebSocket
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const listeners = useRef(new Map<string, Array<(data: any) => void>>());
  
  // Connect to WebSocket server
  useEffect(() => {
    // Use localhost for development
    const serverUrl = 'ws://localhost:3001';
    
    const connectWebSocket = () => {
      console.log('Connecting to WebSocket server...');
      const ws = new WebSocket(serverUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          console.log(`Received event: ${type}`, data);
          
          // Notify listeners
          const callbacks = listeners.current.get(type);
          if (callbacks) {
            callbacks.forEach(callback => callback(data));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
      
      socket.current = ws;
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, []);
  
  // Subscribe to WebSocket events
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, []);
    }
    listeners.current.get(event)?.push(callback);
    
    return () => {
      const eventListeners = listeners.current.get(event);
      if (eventListeners) {
        listeners.current.set(
          event,
          eventListeners.filter((cb) => cb !== callback)
        );
      }
    };
  }, []);
  
  // Emit events to WebSocket server
  const emit = useCallback((event: string, data: any) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    
    console.log(`Emitting event: ${event}`, data);
    
    // Make sure to correctly type the status
    if (event === 'song:request') {
      const songRequest = data as SongRequest;
      songRequest.status = 'pending' as const;
    } else if (event === 'drink:order') {
      const drinkOrder = data as DrinkOrder;
      drinkOrder.status = 'pending' as const;
    }
    
    socket.current.send(JSON.stringify({ type: event, data }));
  }, []);
  
  return { isConnected, subscribe, emit };
};
