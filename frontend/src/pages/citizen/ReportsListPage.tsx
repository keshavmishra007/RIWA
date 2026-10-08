import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { formatRelativeTime, CATEGORY_CONFIG, STATUS_CONFIG } from '../../utils/helpers';
import { ChevronLeft, Link as LinkIcon, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { reportsApi } from '../../services/api';
import type { Complaint, CivicCategory, IncidentStatus } from '../../types';

export const ReportsListPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'IN_PROGRESS' | 'RESOLVED'>('all');
  const [reports, setReports] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      try {
        const data = await reportsApi.getMyReports();
        if (isMounted) {
          setReports(data);
        }
      } catch (err) {
        console.error('Failed to load citizen reports:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReports = reports.filter((report) => {
    if (filter === 'all') return true;
    if (filter === 'RESOLVED') return report.status === 'RESOLVED' || report.status === 'CLOSED';
    return report.status !== 'RESOLVED' && report.status !== 'CLOSED';
  });

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/citizen/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Reports</h1>
            <p className="text-xs text-slate-500">Track status and live intelligence updates for your civic issues</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'IN_PROGRESS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Active ({reports.filter((r) => r.status !== 'RESOLVED' && r.status !== 'CLOSED').length})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'RESOLVED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Resolved ({reports.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading your reports from Supabase...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => {
            const cat = (report.category || 'other') as CivicCategory;
            const catConfig = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
            const statConfig = STATUS_CONFIG[report.status as IncidentStatus] || STATUS_CONFIG.OPEN;
            const CategoryIcon = catConfig?.icon ? AlertCircle : AlertCircle;

            return (
              <div 
                key={report.id} 
                onClick={() => navigate(`/citizen/my-reports/${report.id}`)}
                className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${catConfig ? `${catConfig.bg} ${catConfig.color}` : 'bg-slate-50 text-slate-600'}`}>
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-600">
                          {report.complaintCode || report.id.substring(0, 8)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{formatRelativeTime(report.createdAt)}</span>
                        {report.imageUrl && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                              <ImageIcon className="w-3 h-3" /> Photo Attached
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Original Citizen Description */}
                      <p className="text-slate-900 font-medium">{report.description}</p>
                      
                      {report.incidentId && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                          <LinkIcon className="w-3 h-3" />
                          Linked to Live Incident
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                    {statConfig && (
                      <Badge variant="default" className={`${statConfig.bg} ${statConfig.color}`}>
                        {statConfig.label}
                      </Badge>
                    )}
                    {catConfig && (
                      <Badge variant="default" className={`${catConfig.bg} ${catConfig.color} border-slate-200`}>
                        {catConfig.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-xl space-y-2">
              <p className="font-medium text-slate-700">No reports found</p>
              <p className="text-sm">There are no reports matching the selected filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
