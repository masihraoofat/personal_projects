
import React from 'react';
import { Song } from '@/common/types';
import { cn } from '@/lib/utils';

interface SongGridProps {
  songs: Song[];
  selectedSong: Song | null;
  onSelectSong: (song: Song) => void;
}

export const SongGrid: React.FC<SongGridProps> = ({ 
  songs, 
  selectedSong, 
  onSelectSong 
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {songs.map((song) => (
        <div 
          key={song.id}
          className={cn(
            "jukebox-item cursor-pointer",
            selectedSong?.id === song.id && "neon-border"
          )}
          onClick={() => onSelectSong(song)}
        >
          <div className="relative pb-[100%]">
            <img 
              src={song.albumArt} 
              alt={song.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
              <h3 className="font-bold text-sm truncate">{song.title}</h3>
              <p className="text-xs text-gray-300 truncate">{song.artist}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
