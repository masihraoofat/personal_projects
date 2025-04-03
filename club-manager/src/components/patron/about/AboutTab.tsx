
import React from 'react';
import { DJ_PROFILE } from '@/common/constants';
import { Instagram, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const AboutTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-bold neon-text animate-pulse-neon">About the DJ</h1>
      
      <div className="relative">
        <img 
          src={DJ_PROFILE.image} 
          alt={DJ_PROFILE.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-2xl font-bold text-white">{DJ_PROFILE.name}</h2>
        </div>
      </div>
      
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-2">Bio</h3>
        <p className="text-gray-300">{DJ_PROFILE.bio}</p>
        
        <Separator className="my-4 bg-white/10" />
        
        <h3 className="text-lg font-semibold mb-2">Follow</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-white/5 hover:bg-white/10"
            asChild
          >
            <a href={`https://youtube.com/${DJ_PROFILE.youtubeChannel}`} target="_blank" rel="noopener noreferrer">
              <Youtube className="h-4 w-4 text-red-500" />
              <span>YouTube: {DJ_PROFILE.youtubeChannel}</span>
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-white/5 hover:bg-white/10"
            asChild
          >
            <a href={`https://instagram.com/${DJ_PROFILE.instagram}`} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4 text-pink-500" />
              <span>Instagram: {DJ_PROFILE.instagram}</span>
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-white/5 hover:bg-white/10"
            asChild
          >
            <a href={DJ_PROFILE.website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Website: {DJ_PROFILE.website}</span>
            </a>
          </Button>
        </div>
      </div>
      
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-2">Book for Events</h3>
        <p className="text-gray-300 text-sm">
          Interested in booking {DJ_PROFILE.name} for your private event or club night?
          Send an email to <span className="text-club-blue">bookings@djbeatmaster.com</span>.
        </p>
      </div>
    </div>
  );
};
