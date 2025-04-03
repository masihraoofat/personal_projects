
import React, { useEffect, useState } from 'react';
import { DrinkOrder } from '@/common/types';
import { useUser } from '@/contexts/UserContext';
import { useWebSocket } from '@/services/WebSocketService';
import { DrinkOrderQueue } from './DrinkOrderQueue';
import { BartenderHeader } from './BartenderHeader';
import { ConnectionStatus } from '../ConnectionStatus';

export const BartenderInterface: React.FC = () => {
  const { currentUser } = useUser();
  const { subscribe, emit, isConnected } = useWebSocket();
  const [drinkOrders, setDrinkOrders] = useState<DrinkOrder[]>([]);

  // Subscribe to drink order updates
  useEffect(() => {
    const unsubscribe = subscribe('drink:orders', (orders: DrinkOrder[]) => {
      // Sort by tip amount and then by time (highest tip and oldest first)
      const sortedOrders = [...orders]
        .filter(o => o.status === 'pending')
        .sort((a, b) => {
          if (b.totalTip !== a.totalTip) {
            return b.totalTip - a.totalTip;
          }
          return a.timestamp - b.timestamp;
        });
        
      setDrinkOrders(sortedOrders);
    });
    
    return () => unsubscribe();
  }, [subscribe]);

  const handleServeDrink = (orderId: string) => {
    emit('drink:serve', { orderId });
  };

  const handleRejectDrink = (orderId: string) => {
    emit('drink:reject', { orderId });
  };

  if (!currentUser || currentUser.role !== 'bartender') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center">
        <BartenderHeader />
        <ConnectionStatus isConnected={isConnected} />
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Drink Orders</h2>
        <DrinkOrderQueue 
          orders={drinkOrders} 
          onServe={handleServeDrink}
          onReject={handleRejectDrink}
        />
      </div>
    </div>
  );
};
