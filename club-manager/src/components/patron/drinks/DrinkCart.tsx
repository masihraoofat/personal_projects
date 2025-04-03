
import React from 'react';
import { DrinkOrderItem } from '@/common/types';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipSelector } from '../music/TipSelector';
import { Separator } from '@/components/ui/separator';

interface DrinkCartProps {
  items: DrinkOrderItem[];
  onUpdateQuantity: (drinkId: string, quantity: number) => void;
  tipAmount: number;
  onTipChange: (amount: number) => void;
  onPlaceOrder: () => void;
}

export const DrinkCart: React.FC<DrinkCartProps> = ({
  items,
  onUpdateQuantity,
  tipAmount,
  onTipChange,
  onPlaceOrder,
}) => {
  const subtotal = items.reduce(
    (total, item) => total + item.drink.price * item.quantity,
    0
  );

  const total = subtotal + tipAmount;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.drink.id} className="flex items-center gap-3">
          <img
            src={item.drink.image}
            alt={item.drink.name}
            className="w-12 h-12 object-cover rounded-md"
          />
          
          <div className="flex-1">
            <h3 className="font-medium">{item.drink.name}</h3>
            <p className="text-sm text-gray-300">${item.drink.price} each</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.drink.id, item.quantity - 1)}
            >
              <Minus size={14} />
            </Button>
            
            <span className="w-6 text-center">{item.quantity}</span>
            
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.drink.id, item.quantity + 1)}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
      ))}
      
      <Separator className="my-2 bg-white/10" />
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Tip:</span>
          <span className="text-club-green">${tipAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Add a tip:</h3>
        <TipSelector currentTip={tipAmount} onSelectTip={onTipChange} />
      </div>
      
      <Button
        className="w-full bg-club-pink hover:bg-club-pink/80"
        onClick={onPlaceOrder}
      >
        Place Order (${total.toFixed(2)})
      </Button>
    </div>
  );
};
