
import React from 'react';
import { useWebSocket } from '@/services/WebSocketService';
import { Badge } from '@/components/ui/badge';

interface DJHeaderProps {
  balance: number;
}

export const DJHeader: React.FC<DJHeaderProps> = ({ balance }) => {
  const { isConnected } = useWebSocket();

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">DJ Dashboard</h1>
          <p className="text-gray-300">Manage song requests and tips</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Badge className={isConnected ? "bg-green-500" : "bg-red-500"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <div>
            <p className="text-sm text-gray-300">Total Tips</p>
            <p className="text-3xl font-bold text-club-green">${balance.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
