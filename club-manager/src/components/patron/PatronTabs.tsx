
import React, { useState } from 'react';
import { TabType } from '@/common/types';
import { Music, GlassWater, ShieldAlert, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MusicTab } from './music/MusicTab';
import { DrinksTab } from './drinks/DrinksTab';
import { SecurityTab } from './security/SecurityTab';
import { AboutTab } from './about/AboutTab';

const TabItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    className={cn(
      'flex flex-col items-center justify-center p-2 flex-1 transition-all duration-300',
      active 
        ? 'text-club-pink border-t-2 border-club-pink' 
        : 'text-gray-400 hover:text-gray-200'
    )}
    onClick={onClick}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export const PatronTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('music');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'music':
        return <MusicTab />;
      case 'drinks':
        return <DrinksTab />;
      case 'security':
        return <SecurityTab />;
      case 'about':
        return <AboutTab />;
      default:
        return <MusicTab />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {renderTabContent()}
      </div>
      
      <div className="glass-card flex bg-club-purple rounded-t-none sticky bottom-0">
        <TabItem
          active={activeTab === 'music'}
          onClick={() => setActiveTab('music')}
          icon={<Music size={20} />}
          label="Music"
        />
        <TabItem
          active={activeTab === 'drinks'}
          onClick={() => setActiveTab('drinks')}
          icon={<GlassWater size={20} />}
          label="Drinks"
        />
        <TabItem
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          icon={<ShieldAlert size={20} />}
          label="Security"
        />
        <TabItem
          active={activeTab === 'about'}
          onClick={() => setActiveTab('about')}
          icon={<UserCircle size={20} />}
          label="About DJ"
        />
      </div>
    </div>
  );
};
