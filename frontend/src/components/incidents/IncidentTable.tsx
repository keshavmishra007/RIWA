import React from 'react';
import type { Incident } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatRelativeTime } from '../../utils/helpers';
import { MapPin, Sparkles, AlertCircle } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  onRowClick?: (incident: Incident) => void;
  onSort?: (field: string) => void;
  _sortBy?: string;
  _sortOrder?: 'asc' | 'desc';
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onRowClick,
  onSort,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('title')}>
                Incident & Location
              </th>
              <th className="px-6 py-3.5 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('category')}>
                Category
              </th>
              <th className="px-6 py-3.5 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('priority')}>
                Priority
              </th>
              <th className="px-6 py-3.5 font-semibold cursor-pointer hover:bg-slate-100 text-center" onClick={() => onSort?.('reportCount')}>
                Reports
              </th>
              <th className="px-6 py-3.5 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('department')}>
                Assigned / AI Routing
              </th>
              <th className="px-6 py-3.5 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('status')}>
                Status
              </th>
              <th className="px-6 py-3.5 font-semibold cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => onSort?.('updatedAt')}>
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {incidents.map((incident) => {
              const assignedDept = incident.departmentName || incident.department;
              const isUnassigned = !incident.departmentId || assignedDept === 'Unassigned';
              const aiDept = incident.aiRecommendedDepartment;
              const hasDiffRecommendation = aiDept && (isUnassigned || aiDept.toLowerCase() !== assignedDept.toLowerCase());

              return (
                <tr 
                  key={incident.id} 
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(incident)}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 line-clamp-1">{incident.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {incident.incidentCode || incident.id}
                      </span>
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                      {incident.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${PRIORITY_CONFIG[incident.priority]?.bg} ${PRIORITY_CONFIG[incident.priority]?.color}`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
                      {incident.reportCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {isUnassigned ? (
                        <span className="inline-flex items-center gap-1 w-fit px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Unassigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center w-fit px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {assignedDept}
                        </span>
                      )}

                      {aiDept && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                          <span>
                            AI Rec: <strong className={hasDiffRecommendation ? 'text-purple-700 font-semibold' : 'text-slate-700'}>{aiDept}</strong>
                            {incident.supportingDepartment && ` + ${incident.supportingDepartment}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_CONFIG[incident.status]?.bg} ${STATUS_CONFIG[incident.status]?.color}`}>
                      {incident.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                    {formatRelativeTime(incident.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
