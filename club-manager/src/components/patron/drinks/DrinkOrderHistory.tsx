
import React from 'react';
import { DrinkOrder } from '@/common/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface DrinkOrderHistoryProps {
  orders: DrinkOrder[];
}

export const DrinkOrderHistory: React.FC<DrinkOrderHistoryProps> = ({ orders }) => {
  // Sort orders by timestamp (newest first)
  const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

  const getStatusBadge = (status: DrinkOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-club-blue">Pending</Badge>;
      case 'preparing':
        return <Badge className="bg-yellow-500">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-club-green">Ready</Badge>;
      case 'delivered':
        return <Badge className="bg-green-600">Delivered</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (orders.length === 0) {
    return <p className="text-gray-400 text-center py-4">No order history yet</p>;
  }

  return (
    <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
      {sortedOrders.map((order) => (
        <div key={order.id} className="bg-white/5 rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-gray-400">
                {format(new Date(order.timestamp), 'MMM d, h:mm a')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-medium">Order #{order.id.slice(-4)}</p>
                {getStatusBadge(order.status)}
              </div>
            </div>
            <p className="text-club-green font-medium">${order.totalTip} tip</p>
          </div>
          
          <ul className="text-sm space-y-1 mt-2">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.quantity}x {item.drink.name}</span>
                <span>${(item.drink.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
