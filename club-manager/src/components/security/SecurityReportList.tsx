
import React from 'react';
import { SecurityReport } from '@/common/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SecurityReportListProps {
  reports: SecurityReport[];
  onResolve: (reportId: string) => void;
}

export const SecurityReportList: React.FC<SecurityReportListProps> = ({ 
  reports, 
  onResolve 
}) => {
  const getSeverityBadge = (severity: SecurityReport['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500"><AlertTriangle className="w-3 h-3 mr-1" /> High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: SecurityReport['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">New</Badge>;
      case 'reviewing':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Reviewing</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-500 border-green-500">Resolved</Badge>;
      default:
        return null;
    }
  };

  if (reports.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
          <p className="text-lg font-medium">No active reports</p>
          <p className="text-gray-400 text-center">All security concerns have been addressed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className={`glass-card ${report.severity === 'high' ? 'border border-red-500/50' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2">
                  {getSeverityBadge(report.severity)}
                  {getStatusBadge(report.status)}
                </div>
                <p className="text-xs text-gray-400">
                  {format(new Date(report.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
              
              <h3 className="font-medium text-lg mt-2">Location: {report.location}</h3>
              
              <div className="mt-1 bg-white/5 p-3 rounded-md">
                <p className="text-gray-300">{report.description}</p>
              </div>
              
              <div className="mt-3 text-sm">
                <span className="text-gray-400">Reported by:</span> {report.patronName}
              </div>
            </CardContent>
            
            {report.status !== 'resolved' && (
              <CardFooter className="pt-0">
                <Button
                  className="w-full mt-2 bg-green-600 hover:bg-green-700"
                  onClick={() => onResolve(report.id)}
                >
                  Mark as Resolved
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
