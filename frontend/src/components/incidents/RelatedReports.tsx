import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, MapPin, Image as ImageIcon } from 'lucide-react';
import type { IncidentReport } from '../../types';
import { formatRelativeTime } from '../../utils/helpers';

interface RelatedReportsProps {
  reports: IncidentReport[];
}

export const RelatedReports: React.FC<RelatedReportsProps> = ({ reports }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show first 3 if collapsed, all if expanded
  const displayReports = isExpanded ? reports : reports.slice(0, 3);
  const hasMore = reports.length > 3;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-slate-900">Related Reports ({reports.length})</h3>
        <button className="p-1 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {displayReports.map((report) => (
          <div key={report.complaintId} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono font-medium text-slate-500">#{report.complaintId}</span>
              {report.fusionScore != null && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {report.fusionScore >= 100 ? 'Initial Report' : `${report.fusionScore}% Match`}
                </span>
              )}
            </div>
            
            <p className="text-sm text-slate-700 mb-2 line-clamp-2">{report.complaint.description}</p>
            {report.complaint.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 max-w-xs">
                <img
                  src={report.complaint.imageUrl}
                  alt="Citizen evidence"
                  className="w-full h-32 object-cover hover:opacity-95 transition-opacity"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatRelativeTime(report.complaint.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>250m away</span>
                </div>
              </div>
              
              {report.complaint.imageUrl && (
                <div className="flex items-center gap-1 text-slate-400">
                  <ImageIcon size={14} />
                  <span>1</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && !isExpanded && (
        <div 
          className="p-3 text-center text-sm font-medium text-blue-600 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-t border-slate-100"
          onClick={() => setIsExpanded(true)}
        >
          View {reports.length - 3} more reports
        </div>
      )}
    </div>
  );
};
