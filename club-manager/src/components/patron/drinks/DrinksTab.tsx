
import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Drink, DrinkOrder, DrinkOrderItem } from '@/common/types';
import { SAMPLE_DRINKS, TIP_AMOUNTS } from '@/common/constants';
import { useWebSocket } from '@/services/WebSocketService';
import { DrinkGrid } from './DrinkGrid';
import { DrinkCart } from './DrinkCart';
import { DrinkOrderHistory } from './DrinkOrderHistory';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const DrinksTab: React.FC = () => {
  const { currentUser } = useUser();
  const { subscribe, emit } = useWebSocket();
  const [drinks] = useState<Drink[]>(SAMPLE_DRINKS);
  const [filteredDrinks, setFilteredDrinks] = useState<Drink[]>(SAMPLE_DRINKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<DrinkOrderItem[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(TIP_AMOUNTS[1]);
  const [orderHistory, setOrderHistory] = useState<DrinkOrder[]>([]);
  const { toast } = useToast();

  // Filter drinks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDrinks(drinks);
      return;
    }
    
    const filtered = drinks.filter(drink => 
      drink.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drink.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredDrinks(filtered);
  }, [searchQuery, drinks]);

  // Subscribe to order updates
  useEffect(() => {
    if (!currentUser) return;

    const handleOrderUpdate = (orders: DrinkOrder[]) => {
      // Filter orders for current user
      const userOrders = orders.filter(order => order.patronId === currentUser.id);
      setOrderHistory(userOrders);
    };

    const unsubscribe = subscribe('drink:orders', handleOrderUpdate);
    return () => unsubscribe();
  }, [currentUser, subscribe]);

  const handleAddToCart = (drink: Drink) => {
    setCart(prev => {
      const existing = prev.find(item => item.drink.id === drink.id);
      if (existing) {
        return prev.map(item => 
          item.drink.id === drink.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { drink, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (drinkId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.drink.id !== drinkId));
    } else {
      setCart(prev => 
        prev.map(item => 
          item.drink.id === drinkId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handlePlaceOrder = () => {
    if (!currentUser || cart.length === 0) return;

    const order: DrinkOrder = {
      id: '', // Will be assigned by server
      patronId: currentUser.id,
      patronName: currentUser.name,
      items: [...cart],
      totalTip: tipAmount,
      status: 'pending',
      timestamp: Date.now()
    };

    emit('drink:order', order);
    
    toast({
      title: 'Drink order placed!',
      description: 'Your drink order has been sent to the bar.',
    });
    
    // Clear cart
    setCart([]);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-110px)]">
      <h1 className="text-center text-3xl font-bold neon-text animate-pulse-neon">Drinks Menu</h1>
      
      <div className="relative">
        <Input
          placeholder="Search drinks by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <DrinkGrid drinks={filteredDrinks} onAddToCart={handleAddToCart} />
        
        {orderHistory.length > 0 && (
          <div className="glass-card p-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Order History</h2>
            <Separator className="my-2 bg-white/10" />
            <DrinkOrderHistory orders={orderHistory} />
          </div>
        )}
      </div>
      
      {cart.length > 0 && (
        <div className="glass-card p-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">Your Cart</h2>
          <DrinkCart 
            items={cart} 
            onUpdateQuantity={handleUpdateQuantity} 
            tipAmount={tipAmount}
            onTipChange={setTipAmount}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      )}
    </div>
  );
};
