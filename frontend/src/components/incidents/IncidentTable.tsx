import React from 'react';
import type { Incident } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatRelativeTime } from '../../utils/helpers';

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
              <th className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('title')}>
                Incident
              </th>
              <th className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('category')}>
                Category
              </th>
              <th className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('priority')}>
                Priority
              </th>
              <th className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('reportCount')}>
                Reports
              </th>
              <th className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('department')}>
                Department
              </th>
              <th className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('status')}>
                Status
              </th>
              <th className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => onSort?.('updatedAt')}>
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {incidents.map((incident) => (
              <tr 
                key={incident.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(incident)}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{incident.title}</div>
                  <div className="text-xs text-slate-500">#{incident.id}</div>
                </td>
                <td className="px-6 py-4">{incident.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_CONFIG[incident.priority]?.bg} ${PRIORITY_CONFIG[incident.priority]?.color}`}>
                    {incident.priority}
                  </span>
                </td>
                <td className="px-6 py-4">{incident.reportCount}</td>
                <td className="px-6 py-4">{incident.department}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_CONFIG[incident.status]?.bg} ${STATUS_CONFIG[incident.status]?.color}`}>
                    {incident.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {formatRelativeTime(incident.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
