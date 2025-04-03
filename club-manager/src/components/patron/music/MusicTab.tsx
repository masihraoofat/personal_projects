
import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Song, SongRequest } from '@/common/types';
import { SAMPLE_SONGS, TIP_AMOUNTS } from '@/common/constants';
import { useWebSocket } from '@/services/WebSocketService';
import { SongGrid } from './SongGrid';
import { SongRequestInfo } from './SongRequestInfo';
import { TipSelector } from './TipSelector';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const MusicTab: React.FC = () => {
  const { currentUser } = useUser();
  const { subscribe, emit } = useWebSocket();
  const [songs] = useState<Song[]>(SAMPLE_SONGS);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>(SAMPLE_SONGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(TIP_AMOUNTS[1]);
  const [userRequest, setUserRequest] = useState<SongRequest | null>(null);
  const [allRequests, setAllRequests] = useState<SongRequest[]>([]);
  const { toast } = useToast();

  // Filter songs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSongs(songs);
      return;
    }
    
    const filtered = songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  // Subscribe to song queue updates
  useEffect(() => {
    const unsubscribe = subscribe('song:queue', (requests: SongRequest[]) => {
      setAllRequests(requests);
      
      // Find user's request in the updated queue
      if (currentUser) {
        const patronRequest = requests.find(r => 
          r.patronId === currentUser.id || 
          (r.contributorIds && r.contributorIds.includes(currentUser.id))
        );
        setUserRequest(patronRequest || null);
        
        // If user has a request, make sure it's selected
        if (patronRequest) {
          setSelectedSong(patronRequest.song);
        }
      }
    });
    
    return () => unsubscribe();
  }, [subscribe, currentUser]);

  const handleSongSelect = (song: Song) => {
    // If user already has a request, they can't select another song
    if (userRequest) {
      toast({
        title: 'You already have a song request',
        description: 'You can only request one song at a time.',
        variant: 'default',
      });
      return;
    }
    
    setSelectedSong(song);
  };

  const handleRequestSong = () => {
    if (!selectedSong || !currentUser) return;
    
    const request: SongRequest = {
      id: '', // Will be assigned by server
      song: selectedSong,
      patronId: currentUser.id,
      patronName: currentUser.name,
      tipAmount,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    emit('song:request', request);
    toast({
      title: 'Song requested!',
      description: `Your request for ${selectedSong.title} has been sent.`,
    });
  };
  
  const handleUpdateTip = (newTip: number) => {
    if (!userRequest) return;
    
    setTipAmount(newTip);
    emit('song:update-tip', {
      requestId: userRequest.id,
      newTipAmount: newTip
    });
    
    toast({
      title: 'Tip updated!',
      description: `Your tip for ${userRequest.song.title} has been updated to $${newTip}.`,
    });
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-110px)]">
      <h1 className="text-center text-3xl font-bold neon-text animate-pulse-neon">Music Jukebox</h1>
      
      <div className="relative">
        <Input
          placeholder="Search by song title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {userRequest ? (
          <div className="glass-card p-4 animate-float">
            <h2 className="text-lg font-semibold mb-2">Your Request</h2>
            <SongRequestInfo 
              request={userRequest} 
              position={userRequest.queuePosition || 0} 
            />
            
            <Separator className="my-4 bg-white/10" />
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Boost your request</h3>
              <TipSelector 
                currentTip={userRequest.tipAmount}
                onSelectTip={handleUpdateTip}
              />
            </div>
          </div>
        ) : (
          <SongGrid 
            songs={filteredSongs} 
            selectedSong={selectedSong} 
            onSelectSong={handleSongSelect} 
          />
        )}
      </div>
      
      {selectedSong && !userRequest && (
        <div className="glass-card p-4 mt-4">
          <div className="flex items-center gap-3">
            <img 
              src={selectedSong.albumArt} 
              alt={selectedSong.title} 
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="font-medium">{selectedSong.title}</h3>
              <p className="text-sm text-gray-300">{selectedSong.artist}</p>
            </div>
          </div>
          
          <Separator className="my-3 bg-white/10" />
          
          <TipSelector 
            currentTip={tipAmount}
            onSelectTip={setTipAmount}
          />
          
          <Button 
            className="w-full mt-3 bg-club-pink hover:bg-club-pink/80"
            onClick={handleRequestSong}
          >
            Request Song (${tipAmount} tip)
          </Button>
        </div>
      )}
    </div>
  );
};
