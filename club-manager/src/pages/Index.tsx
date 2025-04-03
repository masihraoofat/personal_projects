
import React from 'react';
import { UserProvider } from '@/contexts/UserContext';
import { useUser } from '@/contexts/UserContext';
import { UserSelector } from '@/components/UserSelector';
import { PatronTabs } from '@/components/patron/PatronTabs';
import { DJInterface } from '@/components/dj/DJInterface';
import { BartenderInterface } from '@/components/bartender/BartenderInterface';
import { SecurityInterface } from '@/components/security/SecurityInterface';

const AppContent: React.FC = () => {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <UserSelector />;
  }

  switch (currentUser.role) {
    case 'patron':
      return <PatronTabs />;
    case 'dj':
      return <DJInterface />;
    case 'bartender':
      return <BartenderInterface />;
    case 'security':
      return <SecurityInterface />;
    default:
      return <UserSelector />;
  }
};

const Index: React.FC = () => {
  return (
    <UserProvider>
      <div className="min-h-screen">
        <AppContent />
      </div>
    </UserProvider>
  );
};

export default Index;
