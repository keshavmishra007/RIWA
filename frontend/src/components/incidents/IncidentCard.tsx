import React from 'react';
import { Clock, MessageSquare, MapPin, Sparkles, Building2, AlertCircle } from 'lucide-react';
import type { Incident } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatRelativeTime } from '../../utils/helpers';

interface IncidentCardProps {
  incident: Incident;
  onClick?: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
  const isCritical = incident.priority === 'CRITICAL';
  const assignedDept = incident.departmentName || incident.department;
  const isUnassigned = !incident.departmentId || assignedDept === 'Unassigned';
  const aiDept = incident.aiRecommendedDepartment;

  return (
    <div 
      className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between ${
        isCritical ? 'border-l-4 border-l-red-600' : 'border-slate-200'
      }`}
      onClick={() => onClick && onClick(incident)}
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {incident.incidentCode || incident.id}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${PRIORITY_CONFIG[incident.priority]?.bg} ${PRIORITY_CONFIG[incident.priority]?.color}`}>
              {incident.priority}
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_CONFIG[incident.status]?.bg} ${STATUS_CONFIG[incident.status]?.color}`}>
              {incident.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
          {incident.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin size={13} className="text-slate-400 shrink-0" />
          <span>{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
        </div>

        {/* Department & AI Routing Badges */}
        <div className="flex flex-col gap-1.5 my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Building2 size={13} /> Assigned:
            </span>
            {isUnassigned ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                <AlertCircle size={11} /> Unassigned
              </span>
            ) : (
              <span className="font-semibold text-slate-800">{assignedDept}</span>
            )}
          </div>

          {aiDept && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span className="text-purple-600 flex items-center gap-1">
                <Sparkles size={12} /> AI Rec:
              </span>
              <span className="font-medium text-purple-900 text-right">
                {aiDept}
                {incident.supportingDepartment && ` + ${incident.supportingDepartment}`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5 font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
          <MessageSquare size={13} />
          <span>{incident.reportCount} reports fused</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Clock size={12} />
          <span>{formatRelativeTime(incident.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
