
export interface User {
  id: string;
  name: string;
  role: 'patron' | 'dj' | 'bartender' | 'security';
  balance?: number; // For DJ only
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: string; // Format: "3:45"
}

export interface SongRequest {
  id: string;
  song: Song;
  patronId: string;
  patronName: string;
  tipAmount: number;
  status: 'pending' | 'playing' | 'played' | 'rejected';
  timestamp: number;
  queuePosition?: number; // Position in the queue
  contributorIds?: string[]; // IDs of patrons who contributed to this request
}

export interface Drink {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: 'cocktail' | 'beer' | 'wine' | 'non-alcoholic' | 'shot';
}

export interface DrinkOrderItem {
  drink: Drink;
  quantity: number;
}

export interface DrinkOrder {
  id: string;
  patronId: string;
  patronName: string;
  items: DrinkOrderItem[];
  totalTip: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'rejected';
  timestamp: number;
}

export interface SecurityReport {
  id: string;
  patronId: string;
  patronName?: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  status: 'submitted' | 'reviewing' | 'resolved';
}

export interface DJProfile {
  name: string;
  bio: string;
  image: string;
  youtubeChannel: string;
  instagram: string;
  website: string;
}

export type TabType = 'music' | 'drinks' | 'security' | 'about';
