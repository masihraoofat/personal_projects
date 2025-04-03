
import React from 'react';
import { TIP_AMOUNTS } from '@/common/constants';
import { cn } from '@/lib/utils';

interface TipSelectorProps {
  currentTip: number;
  onSelectTip: (amount: number) => void;
}

export const TipSelector: React.FC<TipSelectorProps> = ({ 
  currentTip, 
  onSelectTip 
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-between">
      {TIP_AMOUNTS.map((amount) => (
        <button
          key={amount}
          className={cn(
            "px-4 py-2 rounded-full transition-all duration-200",
            currentTip === amount
              ? "bg-club-pink text-white shadow-[0_0_10px_rgba(255,46,126,0.5)]"
              : "bg-white/10 hover:bg-white/20 text-white"
          )}
          onClick={() => onSelectTip(amount)}
        >
          ${amount}
        </button>
      ))}
    </div>
  );
};
