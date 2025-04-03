
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export const SecurityHeader: React.FC = () => {
  const { currentUser } = useUser();

  if (!currentUser) return null;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-500/20 p-3 rounded-full">
          <ShieldAlert className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-gray-400">Welcome, {currentUser.name}</p>
        </div>
      </div>
      
      <Card className="glass-card ml-auto">
        <CardContent className="flex items-center gap-4 p-4">
          <div>
            <div className="text-sm text-gray-400">Current Status</div>
            <div className="font-semibold flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Active Duty
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
