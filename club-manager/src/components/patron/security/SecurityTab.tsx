
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { SecurityReport } from '@/common/types';
import { SecurityForm } from './SecurityForm';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/services/WebSocketService';

export const SecurityTab: React.FC = () => {
  const { currentUser } = useUser();
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const { toast } = useToast();
  const { emit } = useWebSocket();

  const handleSubmitReport = (report: Omit<SecurityReport, 'id' | 'patronId' | 'timestamp' | 'status'>) => {
    if (!currentUser) return;

    const newReport: SecurityReport = {
      ...report,
      id: '', // Will be assigned by the server
      patronId: currentUser.id,
      patronName: currentUser.name,
      timestamp: Date.now(),
      status: 'submitted'
    };

    // Send to server
    emit('security:report', newReport);
    
    toast({
      title: 'Report submitted',
      description: 'Security has been notified and will address your concern.',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-bold neon-text animate-pulse-neon">Contact Security</h1>
      
      <div className="glass-card p-4">
        <p className="text-gray-300 mb-4">
          Notice something concerning? Let our security team know and they'll address the issue immediately.
        </p>
        
        <SecurityForm onSubmit={handleSubmitReport} />
      </div>
    </div>
  );
};
