
import { Song, Drink, DJProfile, User } from './types';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'p1', name: 'Patron 1', role: 'patron' },
  { id: 'p2', name: 'Patron 2', role: 'patron' },
  { id: 'p3', name: 'Patron 3', role: 'patron' },
  { id: 'p4', name: 'Patron 4', role: 'patron' },
  { id: 'p5', name: 'Patron 5', role: 'patron' },
  { id: 'dj1', name: 'DJ Beatmaster', role: 'dj', balance: 0 },
  { id: 'b1', name: 'Bartender 1', role: 'bartender' },
  { id: 's1', name: 'Security 1', role: 'security' },
];

// DJ Profile
export const DJ_PROFILE: DJProfile = {
  name: 'DJ Beatmaster',
  bio: 'Spinning the hottest tracks for over 10 years. Specializing in EDM, Hip-Hop, and Top 40 remixes.',
  image: 'https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?q=80&w=2340&auto=format&fit=crop',
  youtubeChannel: 'DJBeatmaster',
  instagram: '@dj_beatmaster',
  website: 'https://djbeatmaster.com'
};

// Sample Songs
export const SAMPLE_SONGS: Song[] = [
  {
    id: 's1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop',
    duration: '3:20'
  },
  {
    id: 's2',
    title: 'Don\'t Start Now',
    artist: 'Dua Lipa',
    albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop',
    duration: '3:03'
  },
  {
    id: 's3',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
    duration: '2:54'
  },
  {
    id: 's4',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop',
    duration: '3:14'
  },
  {
    id: 's5',
    title: 'Levitating',
    artist: 'Dua Lipa ft. DaBaby',
    albumArt: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=2070&auto=format&fit=crop',
    duration: '3:23'
  },
  {
    id: 's6',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop',
    duration: '3:35'
  },
  {
    id: 's7',
    title: 'Positions',
    artist: 'Ariana Grande',
    albumArt: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop',
    duration: '2:52'
  },
  {
    id: 's8',
    title: 'Mood',
    artist: '24kGoldn ft. iann dior',
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop',
    duration: '2:20'
  },
  {
    id: 's9',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
    duration: '2:58'
  },
  {
    id: 's10',
    title: 'Kiss Me More',
    artist: 'Doja Cat ft. SZA',
    albumArt: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop',
    duration: '3:28'
  },
];

// Sample Drinks
export const SAMPLE_DRINKS: Drink[] = [
  {
    id: 'd1',
    name: 'Mojito',
    price: 12,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=2070&auto=format&fit=crop',
    description: 'Refreshing mix of white rum, sugar, lime juice, soda water, and mint',
    category: 'cocktail'
  },
  {
    id: 'd2',
    name: 'Old Fashioned',
    price: 14,
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2069&auto=format&fit=crop',
    description: 'Classic cocktail with bourbon, sugar, bitters and citrus',
    category: 'cocktail'
  },
  {
    id: 'd3',
    name: 'Craft IPA',
    price: 8,
    image: 'https://images.unsplash.com/photo-1532634740-6837b2a21d39?q=80&w=2071&auto=format&fit=crop',
    description: 'Hoppy India Pale Ale from local brewery',
    category: 'beer'
  },
  {
    id: 'd4',
    name: 'Margarita',
    price: 13,
    image: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?q=80&w=2076&auto=format&fit=crop',
    description: 'Tequila, lime, and orange liqueur with salt rim',
    category: 'cocktail'
  },
  {
    id: 'd5',
    name: 'Sparkling Water',
    price: 4,
    image: 'https://images.unsplash.com/photo-1546897003-162a18ca2a55?q=80&w=2070&auto=format&fit=crop',
    description: 'Refreshing sparkling water with lime',
    category: 'non-alcoholic'
  },
  {
    id: 'd6',
    name: 'Red Wine',
    price: 10,
    image: 'https://images.unsplash.com/photo-1553361371-9513901d383f?q=80&w=2069&auto=format&fit=crop',
    description: 'Glass of house red wine',
    category: 'wine'
  },
  {
    id: 'd7',
    name: 'Whiskey Shot',
    price: 9,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=2034&auto=format&fit=crop',
    description: 'Premium whiskey shot',
    category: 'shot'
  },
  {
    id: 'd8',
    name: 'Club Soda',
    price: 3,
    image: 'https://images.unsplash.com/photo-1596803244618-8dab45d367fa?q=80&w=2071&auto=format&fit=crop',
    description: 'Refreshing club soda with lime',
    category: 'non-alcoholic'
  },
];

export const TIP_AMOUNTS = [1, 2, 5, 10, 20, 50, 100];
