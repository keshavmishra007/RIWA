import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reportsApi } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { formatRelativeTime, CATEGORY_CONFIG, STATUS_CONFIG } from '../../utils/helpers';
import type { CivicCategory, IncidentStatus, Complaint } from '../../types';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myReports, setMyReports] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      try {
        const data = await reportsApi.getMyReports();
        if (isMounted) {
          setMyReports(data);
        }
      } catch (err) {
        console.error('Error fetching citizen reports:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const inProgressCount = myReports.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' || c.status === 'OPEN'
  ).length;
  const resolvedCount = myReports.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  const recentReports = myReports.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good evening, {user?.name || 'Citizen'}</h1>
          <p className="text-slate-500">Report a civic issue and help improve Rewa</p>
        </div>
        <button
          onClick={() => navigate('/citizen/report')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full md:w-auto justify-center shadow-sm"
        >
          <Plus className="w-5 h-5" />
          REPORT AN ISSUE
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">My Reports</p>
              <p className="text-2xl font-bold text-slate-900">
                {isLoading ? '...' : myReports.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <p className="text-2xl font-bold text-slate-900">
                {isLoading ? '...' : inProgressCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Resolved</p>
              <p className="text-2xl font-bold text-slate-900">
                {isLoading ? '...' : resolvedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Reports</h2>
          {myReports.length > 0 && (
            <button
              onClick={() => navigate('/citizen/my-reports')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm">Loading your reports...</span>
          </div>
        ) : myReports.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-800">No civic reports submitted yet</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You haven't reported any civic issues yet. Click "Report an Issue" above to submit road damage, garbage, drainage problems, or other community concerns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recentReports.map((report) => {
              const cat = (report.category || 'other') as CivicCategory;
              const catConfig = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
              const statConfig = STATUS_CONFIG[report.status as IncidentStatus] || STATUS_CONFIG.OPEN;

              return (
                <div
                  key={report.id}
                  onClick={() => navigate(`/citizen/my-reports/${report.id}`)}
                  className="bg-white border border-slate-200 p-4 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-slate-900 font-medium line-clamp-1">{report.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-mono">{report.complaintCode || report.id.substring(0, 8)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(report.createdAt)}</span>
                      {report.imageUrl && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">📷 Photo attached</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {catConfig && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${catConfig.bg} ${catConfig.color}`}>
                        {catConfig.label}
                      </span>
                    )}
                    {statConfig && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statConfig.bg} ${statConfig.color}`}>
                        {statConfig.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
