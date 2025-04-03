
import React from 'react';
import { DrinkOrder } from '@/common/types';
import { Button } from '@/components/ui/button';
import { Check, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface DrinkOrderQueueProps {
  orders: DrinkOrder[];
  onServe: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export const DrinkOrderQueue: React.FC<DrinkOrderQueueProps> = ({ 
  orders, 
  onServe, 
  onReject 
}) => {
  if (orders.length === 0) {
    return (
      <Card className="bg-club-purple/30 border-club-purple/20">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No drink orders in the queue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <Card 
          key={order.id} 
          className={`bg-club-purple/30 border-club-purple/20 overflow-hidden
            ${index === 0 ? 'ring-2 ring-club-pink/50' : ''}`}
        >
          <div className="flex">
            {/* Left tip indicator */}
            <div className="bg-club-pink w-2"></div>
            
            <CardContent className="p-4 w-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">Order from {order.patronName}</h3>
                  <p className="text-xs text-gray-400">
                    Ordered at {format(new Date(order.timestamp), 'h:mm a')}
                  </p>
                </div>
                <span className="text-lg font-bold text-club-green">${order.totalTip}</span>
              </div>
              
              <div className="bg-black/20 rounded-md p-3 mb-3">
                <ul className="space-y-1">
                  {order.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex justify-between">
                      <span>{item.quantity}x {item.drink.name}</span>
                      <span>${(item.drink.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  className="bg-club-green hover:bg-club-green/80"
                  onClick={() => onServe(order.id)}
                >
                  <Check size={16} className="mr-1" />
                  Serve
                </Button>
                
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:bg-red-500/10"
                  onClick={() => onReject(order.id)}
                >
                  <Ban size={16} className="mr-1" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};
