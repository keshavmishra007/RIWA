import React from 'react';
import type { StatusLog } from '../../types';
import { formatRelativeTime } from '../../utils/helpers';

interface IncidentTimelineProps {
  logs: StatusLog[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ logs }) => {
  // Sort logs most recent first if they aren't already
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getDotColor = (type?: string) => {
    switch (type) {
      case 'system': return 'bg-blue-500 border-blue-200';
      case 'escalation': return 'bg-red-500 border-red-200';
      case 'action': return 'bg-green-500 border-green-200';
      default: return 'bg-slate-400 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-slate-900 mb-5">Incident Timeline</h3>
      
      <div className="relative pl-3">
        {/* Vertical line connecting dots */}
        <div className="absolute top-2 bottom-2 left-[15px] w-0.5 bg-slate-200 -z-10" />
        
        <div className="space-y-6">
          {sortedLogs.map((log, index) => (
            <div key={index} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 bg-white ${getDotColor(log.actorId ? 'action' : 'system')} mt-1.5`} />
              </div>
              
              <div className="flex-1 pb-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    Status changed to {log.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">
                    {formatRelativeTime(log.timestamp)}
                  </span>
                </div>
                
                {log.note && (
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {log.note}
                  </p>
                )}
                
                {log.actorId && (
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">
                    By user: {log.actorName || log.actorId}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-4">
              No timeline events recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
