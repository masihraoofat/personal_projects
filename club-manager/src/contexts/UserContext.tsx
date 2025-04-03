
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../common/types';
import { MOCK_USERS } from '../common/constants';
import { useWebSocket } from '../services/WebSocketService';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  createNewPatron: (username: string) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  users: [],
  createNewPatron: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const { emit, subscribe } = useWebSocket();
  const { toast } = useToast();

  const createNewPatron = (username: string) => {
    const newPatron: User = {
      id: `patron-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: username,
      role: 'patron'
    };

    setUsers(prev => [...prev, newPatron]);
    setCurrentUser(newPatron);
  };

  // When user changes, emit login event
  useEffect(() => {
    if (currentUser) {
      emit('user:login', currentUser);
      
      // Notifications for patron
      if (currentUser.role === 'patron') {
        const songPlayedUnsubscribe = subscribe(
          `patron:${currentUser.id}:song-played`, 
          (request) => {
            toast({
              title: 'Your song is playing!',
              description: `${request.song.title} by ${request.song.artist} is now playing!`,
              variant: 'default',
            });
          }
        );
        
        const songRejectedUnsubscribe = subscribe(
          `patron:${currentUser.id}:song-rejected`, 
          (request) => {
            toast({
              title: 'Song request rejected',
              description: `Your request for ${request.song.title} has been rejected.`,
              variant: 'destructive',
            });
          }
        );
        
        const drinkServedUnsubscribe = subscribe(
          `patron:${currentUser.id}:drink-served`, 
          (order) => {
            toast({
              title: 'Your drink is ready!',
              description: 'Please collect your order from the bar.',
              variant: 'default',
            });
          }
        );
        
        const drinkRejectedUnsubscribe = subscribe(
          `patron:${currentUser.id}:drink-rejected`, 
          (order) => {
            toast({
              title: 'Drink order rejected',
              description: 'Sorry, your drink order has been rejected.',
              variant: 'destructive',
            });
          }
        );
        
        return () => {
          songPlayedUnsubscribe();
          songRejectedUnsubscribe();
          drinkServedUnsubscribe();
          drinkRejectedUnsubscribe();
        };
      }
      
      // Updates for DJ
      if (currentUser.role === 'dj') {
        const djUpdateUnsubscribe = subscribe('dj:update', (dj) => {
          setCurrentUser(prev => prev ? { ...prev, balance: dj.balance } : null);
        });
        
        return () => {
          djUpdateUnsubscribe();
        };
      }
    }
  }, [currentUser, emit, subscribe, toast]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users, createNewPatron }}>
      {children}
    </UserContext.Provider>
  );
};
