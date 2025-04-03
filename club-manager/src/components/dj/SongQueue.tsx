
import React from 'react';
import { SongRequest } from '@/common/types';
import { Button } from '@/components/ui/button';
import { Play, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface SongQueueProps {
  requests: SongRequest[];
  onPlay: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const SongQueue: React.FC<SongQueueProps> = ({ 
  requests, 
  onPlay, 
  onReject 
}) => {
  // Filter only pending requests
  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return (
      <Card className="bg-club-purple/30 border-club-purple/20">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No song requests in the queue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((request, index) => (
        <Card 
          key={request.id} 
          className={`bg-club-purple/30 border-club-purple/20 overflow-hidden
            ${index === 0 ? 'ring-2 ring-club-pink/50' : ''}`}
        >
          <div className="flex">
            {/* Left tip indicator */}
            <div className="bg-club-pink w-2"></div>
            
            <CardContent className="p-4 flex items-center w-full">
              <div className="flex items-center flex-1 gap-4">
                <img 
                  src={request.song.albumArt} 
                  alt={request.song.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{request.song.title}</h3>
                      <p className="text-sm text-gray-300">{request.song.artist}</p>
                    </div>
                    <span className="text-lg font-bold text-club-green">${request.tipAmount}</span>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      Requested by {request.patronName} - {format(new Date(request.timestamp), 'h:mm a')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Duration: {request.song.duration}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                {index === 0 ? (
                  <Button 
                    className="bg-club-blue hover:bg-club-blue/80"
                    onClick={() => onPlay(request.id)}
                  >
                    <Play size={16} className="mr-1" />
                    Play Now
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => onPlay(request.id)}
                  >
                    <Play size={16} className="mr-1" />
                    Play
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:bg-red-500/10"
                  onClick={() => onReject(request.id)}
                >
                  <Ban size={16} />
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};
