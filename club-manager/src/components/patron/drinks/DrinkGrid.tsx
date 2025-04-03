
import React from 'react';
import { Drink } from '@/common/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrinkGridProps {
  drinks: Drink[];
  onAddToCart: (drink: Drink) => void;
}

export const DrinkGrid: React.FC<DrinkGridProps> = ({ drinks, onAddToCart }) => {
  // Group drinks by category
  const drinksByCategory = drinks.reduce((acc, drink) => {
    if (!acc[drink.category]) {
      acc[drink.category] = [];
    }
    acc[drink.category].push(drink);
    return acc;
  }, {} as Record<string, Drink[]>);

  // Format category names for display
  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {Object.entries(drinksByCategory).map(([category, categoryDrinks]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-xl font-semibold capitalize text-club-pink">
            {formatCategory(category)}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryDrinks.map((drink) => (
              <div key={drink.id} className="glass-card p-3 flex items-center gap-3">
                <img 
                  src={drink.image} 
                  alt={drink.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{drink.name}</h3>
                    <span className="text-club-green">${drink.price}</span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                    {drink.description}
                  </p>
                </div>
                
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="ml-auto text-club-blue hover:text-white hover:bg-club-blue"
                  onClick={() => onAddToCart(drink)}
                >
                  <Plus size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
