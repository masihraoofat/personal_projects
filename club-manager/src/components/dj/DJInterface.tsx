
import React, { useEffect, useState } from 'react';
import { SongRequest } from '@/common/types';
import { useUser } from '@/contexts/UserContext';
import { useWebSocket } from '@/services/WebSocketService';
import { SongQueue } from './SongQueue';
import { DJHeader } from './DJHeader';
import { ConnectionStatus } from '../ConnectionStatus';

export const DJInterface: React.FC = () => {
  const { currentUser } = useUser();
  const { subscribe, emit, isConnected } = useWebSocket();
  const [songRequests, setSongRequests] = useState<SongRequest[]>([]);

  // Subscribe to song queue updates
  useEffect(() => {
    const unsubscribe = subscribe('song:queue', (requests: SongRequest[]) => {
      // Sort by tip amount (highest first)
      const sortedRequests = [...requests].sort((a, b) => b.tipAmount - a.tipAmount);
      setSongRequests(sortedRequests);
    });
    
    return () => unsubscribe();
  }, [subscribe]);

  const handlePlaySong = (requestId: string) => {
    emit('song:play', { requestId });
  };

  const handleRejectSong = (requestId: string) => {
    emit('song:reject', { requestId });
  };

  if (!currentUser || currentUser.role !== 'dj') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center">
        <DJHeader balance={currentUser.balance || 0} />
        <ConnectionStatus isConnected={isConnected} />
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Song Requests</h2>
        <SongQueue 
          requests={songRequests} 
          onPlay={handlePlaySong}
          onReject={handleRejectSong}
        />
      </div>
    </div>
  );
};
