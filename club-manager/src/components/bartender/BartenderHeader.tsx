
import React from 'react';
import { useWebSocket } from '@/services/WebSocketService';
import { Badge } from '@/components/ui/badge';

export const BartenderHeader: React.FC = () => {
  const { isConnected } = useWebSocket();

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bartender Dashboard</h1>
          <p className="text-gray-300">Manage drink orders</p>
        </div>
        <div>
          <Badge className={isConnected ? "bg-green-500" : "bg-red-500"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
