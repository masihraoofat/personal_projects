
import React from 'react';
import { SongRequest } from '@/common/types';
import { ArrowUp, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SongRequestInfoProps {
  request: SongRequest;
  position: number;
}

export const SongRequestInfo: React.FC<SongRequestInfoProps> = ({ 
  request, 
  position 
}) => {
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Badge className="bg-club-blue">{`Queue: #${position}`}</Badge>;
      case 'playing':
        return <Badge className="bg-green-500 animate-pulse">Now Playing</Badge>;
      case 'played':
        return <Badge className="bg-gray-500">Played</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img
          src={request.song.albumArt}
          alt={request.song.title}
          className="w-16 h-16 object-cover rounded-md"
        />
        {request.status === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
            <Music className="w-8 h-8 text-white animate-pulse" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{request.song.title}</h3>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-300">{request.song.artist}</p>
        
        <div className="flex items-center mt-1 text-sm">
          <span className="text-club-green font-medium">${request.tipAmount} tip</span>
          {position > 1 && (
            <div className="flex items-center ml-2 text-xs text-gray-400">
              <ArrowUp className="w-3 h-3 mr-1" />
              <span>Increase tip to move up!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
