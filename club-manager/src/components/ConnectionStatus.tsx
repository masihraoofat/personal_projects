
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from './ui/badge';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  if (isConnected) {
    return (
      <Badge className="ml-auto bg-green-600 flex items-center gap-1">
        <Wifi className="h-3 w-3" />
        <span>Connected</span>
      </Badge>
    );
  }

  return (
    <Badge className="ml-auto bg-red-600 flex items-center gap-1 animate-pulse">
      <WifiOff className="h-3 w-3" />
      <span>Disconnected</span>
    </Badge>
  );
};
