import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MapPin, Clock, Users, Loader2, AlertCircle } from 'lucide-react';
import { CivicMap } from '../../components/map/CivicMap';
import { IncidentBrief } from '../../components/incidents/IncidentBrief';
import { FusionExplanation } from '../../components/incidents/FusionExplanation';
import { RelatedReports } from '../../components/incidents/RelatedReports';
import { IncidentTimeline } from '../../components/incidents/IncidentTimeline';
import { RecommendedAction } from '../../components/incidents/RecommendedAction';
import { StatusControl } from '../../components/incidents/StatusControl';
import { incidentsApi } from '../../services/api';
import { PRIORITY_CONFIG, TREND_CONFIG, STATUS_CONFIG, formatPercentage } from '../../utils/helpers';
import type { Incident, IncidentStatus, FusionExplanation as FusionType } from '../../types';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [relatedReports, setRelatedReports] = useState<any[]>([]);
  const [fusionData, setFusionData] = useState<FusionType | null>(null);
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchIncident = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await incidentsApi.getById(id);
        if (isMounted) {
          setIncident(data.incident);
          setRelatedReports(data.relatedReports || []);
          setFusionData(data.fusionExplanation);
          setStatusLogs(data.statusLogs || []);
        }
      } catch (err: any) {
        console.error('Failed to load incident detail:', err);
        if (isMounted) setError(err.response?.data?.error || 'Incident not found');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchIncident();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!incident) return;
    try {
      const updated = await incidentsApi.updateStatus(incident.id, newStatus, `Status updated to ${newStatus}`);
      setIncident(updated);
      // Refresh status logs
      const fresh = await incidentsApi.getById(incident.id);
      setStatusLogs(fresh.statusLogs || []);
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading incident intelligence and evidence...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen p-12 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Incident Not Found</h2>
        <p className="text-slate-500 text-sm">{error || 'Unable to load incident record.'}</p>
        <Link
          to="/authority/incidents"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Back to Incidents
        </Link>
      </div>
    );
  }

  const priorityStyle = PRIORITY_CONFIG[incident.priority] || PRIORITY_CONFIG.MEDIUM;
  const trendStyle = TREND_CONFIG[incident.trend] || TREND_CONFIG.STABLE;
  const statusStyle = STATUS_CONFIG[incident.status] || STATUS_CONFIG.OPEN;

  const defaultFusion: FusionType = fusionData || {
    semanticScore: 0.85,
    locationScore: 0.9,
    timeScore: 0.85,
    categoryScore: 1.0,
    confidence: incident.fusionConfidence,
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-4 md:p-6 gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Link
          to="/authority/incidents"
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Incidents
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-mono font-bold text-slate-500">
              {incident.incidentCode || incident.id}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{incident.title}</h1>
            <div className="flex gap-2 items-center mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${priorityStyle.bg} ${priorityStyle.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                {priorityStyle.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${trendStyle.color} bg-slate-100`}>
                <TrendingUp className="w-3 h-3" />
                {trendStyle.label}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color} ${statusStyle.bg}`}>
                {statusStyle.label}
              </span>
              {incident.departmentName && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                  {incident.departmentName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusControl currentStatus={incident.status} onStatusChange={handleStatusChange} />
          </div>
        </div>
      </header>

      <hr className="border-slate-200" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Primary Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section A: AI Incident Intelligence */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🤖 AI Incident Intelligence</span>
              </h2>
            </div>
            <IncidentBrief incident={incident} />
            <FusionExplanation explanation={defaultFusion} reportCount={incident.reportCount} />
            {incident.recommendedActions && incident.recommendedActions.length > 0 && (
              <RecommendedAction actions={incident.recommendedActions} department={incident.departmentName || incident.department} />
            )}
          </div>

          {/* Section B: Original Citizen Reports & Evidence */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📋 Citizen Evidence & Original Reports ({relatedReports.length})</span>
              </h2>
              <span className="text-xs text-slate-500">Real citizen submissions from Supabase</span>
            </div>

            {relatedReports.length > 0 ? (
              <RelatedReports reports={relatedReports} />
            ) : (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
                No individual complaint records attached to this incident.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Supporting Info */}
        <div className="flex flex-col gap-6">
          {/* Incident Location Map */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Incident Location
            </h3>
            <div className="h-[250px] rounded-lg overflow-hidden">
              <CivicMap
                incidents={[incident]}
                hotspots={[]}
                height="100%"
                showLegend={false}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Incident Metrics</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Clustered Reports
                </span>
                <span className="font-semibold text-slate-900">{incident.reportCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Impact Radius
                </span>
                <span className="font-semibold text-slate-900">~{incident.areaKm || 0.4} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Trend
                </span>
                <span className={`font-semibold ${trendStyle.color}`}>{trendStyle.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Fusion Confidence</span>
                <span className="font-semibold text-green-600">{formatPercentage(incident.fusionConfidence)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> First Reported
                </span>
                <span className="font-medium text-slate-900 text-sm">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {statusLogs.length > 0 && (
            <IncidentTimeline logs={statusLogs} />
          )}
        </div>
      </div>
    </div>
  );
};
