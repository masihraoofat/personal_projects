
import React, { useEffect, useState } from 'react';
import { SecurityReport } from '@/common/types';
import { useUser } from '@/contexts/UserContext';
import { useWebSocket } from '@/services/WebSocketService';
import { SecurityReportList } from './SecurityReportList';
import { SecurityHeader } from './SecurityHeader';
import { ConnectionStatus } from '../ConnectionStatus';

export const SecurityInterface: React.FC = () => {
  const { currentUser } = useUser();
  const { subscribe, isConnected } = useWebSocket();
  const [securityReports, setSecurityReports] = useState<SecurityReport[]>([]);

  // Subscribe to security reports updates
  useEffect(() => {
    const unsubscribe = subscribe('security:reports', (reports: SecurityReport[]) => {
      // Sort by severity (highest first) and then by time (newest first)
      const sortedReports = [...reports]
        .sort((a, b) => {
          const severityOrder = { high: 3, medium: 2, low: 1 };
          const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
          if (severityDiff !== 0) return severityDiff;
          return b.timestamp - a.timestamp;
        });
        
      setSecurityReports(sortedReports);
    });
    
    return () => unsubscribe();
  }, [subscribe]);

  const handleResolveReport = (reportId: string) => {
    // In a real app, would send to server to update status
    setSecurityReports(prev => 
      prev.map(r => r.id === reportId ? { ...r, status: 'resolved' as const } : r)
    );
  };

  if (!currentUser || currentUser.role !== 'security') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <SecurityHeader />
      <ConnectionStatus isConnected={isConnected} />
      
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Security Reports</h2>
        <SecurityReportList 
          reports={securityReports} 
          onResolve={handleResolveReport}
        />
      </div>
    </div>
  );
};
