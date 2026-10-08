import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi } from '../../services/api';
import { LocationPicker } from '../../components/map/LocationPicker';
import { ReportTimeline } from '../../components/citizen/ReportTimeline';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { ChevronLeft, Link as LinkIcon, MapPin, AlertCircle, Users, Loader2 } from 'lucide-react';
import { formatRelativeTime, CATEGORY_CONFIG, STATUS_CONFIG } from '../../utils/helpers';
import type { Complaint, Incident, CivicCategory, IncidentStatus } from '../../types';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<Complaint | null>(null);
  const [linkedIncident, setLinkedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      if (!id) return;
      try {
        const res = await reportsApi.getById(id);
        if (isMounted) {
          setReport(res.report);
          setLinkedIncident(res.incident || null);
        }
      } catch (err: any) {
        console.error('Failed to load report:', err);
        if (isMounted) setError(err.response?.data?.error || 'Report not found');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReport();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Report Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to locate report record.'}</p>
        <button
          onClick={() => navigate('/citizen/my-reports')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Back to My Reports
        </button>
      </div>
    );
  }

  const cat = (report.category || 'other') as CivicCategory;
  const catConfig = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
  const statConfig = STATUS_CONFIG[report.status as IncidentStatus] || STATUS_CONFIG.OPEN;
  const CategoryIcon = AlertCircle;

  return (
    <div className="max-w-3xl mx-auto p-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Details</h1>
          <p className="text-sm text-slate-500">
            {report.complaintCode || report.id} • {formatRelativeTime(report.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${catConfig ? `${catConfig.bg} ${catConfig.color}` : 'bg-slate-50 text-slate-600'}`}>
                  <CategoryIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {catConfig && (
                      <Badge variant="default" className={`${catConfig.bg} ${catConfig.color} border-slate-200`}>
                        {catConfig.label}
                      </Badge>
                    )}
                    {statConfig && (
                      <Badge variant="default" className={`${statConfig.bg} ${statConfig.color}`}>
                        {statConfig.label}
                      </Badge>
                    )}
                  </div>
                  {/* Original citizen description */}
                  <p className="text-slate-900 font-medium text-lg leading-relaxed">{report.description}</p>
                </div>
              </div>
              
              {/* Real Uploaded Evidence Image */}
              {report.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <div className="p-2 bg-slate-100 border-b border-slate-200 text-xs font-medium text-slate-600 flex items-center justify-between">
                    <span>Uploaded Evidence Photo</span>
                    <a
                      href={report.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Original
                    </a>
                  </div>
                  <img
                    src={report.imageUrl}
                    alt="Citizen evidence photo"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">GPS Coordinates</p>
                  <p className="text-slate-500 text-sm">{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</p>
                </div>
              </div>
              
              <div className="h-48 rounded-xl overflow-hidden border border-slate-200">
                <LocationPicker 
                  initialLat={report.latitude}
                  initialLng={report.longitude}
                  onLocationSelect={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* Linked Incident */}
          {linkedIncident && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Part of a Live Civic Incident</h3>
                    <p className="text-sm text-slate-600">
                      Your report has been auto-fused into an active civic incident tracked by city authorities.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {linkedIncident.incidentCode || linkedIncident.id}
                    </span>
                    <Badge variant="default" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {linkedIncident.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="font-medium text-slate-900">{linkedIncident.title}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {linkedIncident.reportCount} reports clustered
                    </span>
                    <span>Status: {linkedIncident.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Status Timeline</h3>
              <p className="text-xs text-slate-500 mb-4">Report submission to municipal resolution</p>
              {statConfig && (
                <div className="mb-6">
                  <Badge variant="default" className={`${statConfig.bg} ${statConfig.color}`}>
                    Current Status: {statConfig.label}
                  </Badge>
                </div>
              )}
              <ReportTimeline currentStep={report.status === 'RESOLVED' || report.status === 'CLOSED' ? 4 : report.status === 'IN_PROGRESS' ? 3 : 2} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
