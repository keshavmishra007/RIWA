import React from 'react';
import { Clock, MessageSquare, MapPin } from 'lucide-react';
import type { Incident } from '../../types';
import { PRIORITY_CONFIG, formatRelativeTime } from '../../utils/helpers';

interface IncidentCardProps {
  incident: Incident;
  onClick?: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
  const isCritical = incident.priority === 'CRITICAL';
  
  return (
    <div 
      className={`bg-white rounded-lg border shadow-sm p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
        isCritical ? 'border-l-4 border-l-red-600' : 'border-slate-200'
      }`}
      onClick={() => onClick && onClick(incident)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{incident.title}</h3>
        <div className="flex gap-2 shrink-0 ml-4">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_CONFIG[incident.priority]?.bg} ${PRIORITY_CONFIG[incident.priority]?.color}`}>
            {incident.priority}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
        <div className="flex items-center gap-1.5">
          <MessageSquare size={14} />
          <span>{incident.reportCount} reports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={14} />
          <span>{incident.department}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto text-xs">
          <Clock size={12} />
          <span>{formatRelativeTime(incident.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
