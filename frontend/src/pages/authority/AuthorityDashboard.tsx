import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, MapPin, Activity, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../../components/ui/KPICard';
import { Button } from '../../components/ui/Button';
import { CivicMap } from '../../components/map/CivicMap';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { analyticsApi, incidentsApi, hotspotsApi } from '../../services/api';
import type { Incident, Hotspot, AnalyticsOverview } from '../../types';

export const AuthorityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [overviewData, incidentsData, hotspotsData] = await Promise.all([
        analyticsApi.getOverview(),
        incidentsApi.getAll(),
        hotspotsApi.getAll(),
      ]);
      setOverview(overviewData);
      setIncidents(incidentsData);
      setHotspots(hotspotsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const validActiveIncidents = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && (i.reportCount || 0) > 0
  );

  const activeIncidentsCount = overview
    ? overview.activeIncidents
    : validActiveIncidents.length;

  const criticalIncidentsCount = overview
    ? overview.criticalIncidents
    : validActiveIncidents.filter((i) => i.priority === 'CRITICAL').length;

  const criticalQueue = validActiveIncidents
    .filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH')
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">City Intelligence Command Center</h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">Live Supabase Sync</span>
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active Incidents"
          value={isLoading ? '...' : String(activeIncidentsCount)}
          icon={<Activity className="w-5 h-5 text-blue-600" />}
        />
        <KPICard
          label="Critical Priority"
          value={isLoading ? '...' : String(criticalIncidentsCount)}
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          className="border-l-4 border-l-red-500"
        />
        <KPICard
          label="Emerging Hotspots"
          value={isLoading ? '...' : String(hotspots.length)}
          icon={<MapPin className="w-5 h-5 text-orange-500" />}
        />
        <KPICard
          label="Reports Today"
          value={isLoading ? '...' : String(overview?.reportsToday ?? 0)}
          icon={<FileText className="w-5 h-5 text-cyan-600" />}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <div className="w-full lg:w-3/5 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Live Intelligence Map</h2>
            <span className="text-xs text-slate-500 font-medium">{validActiveIncidents.length} active incidents</span>
          </div>
          <div className="h-[420px]">
            <CivicMap
              incidents={validActiveIncidents}
              hotspots={hotspots}
              onIncidentClick={(id: string) => navigate(`/authority/incidents/${id}`)}
            />
          </div>
        </div>

        {/* Critical Queue */}
        <div className="w-full lg:w-2/5 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
              <h2 className="text-lg font-semibold text-slate-900">Priority Action Queue</h2>
            </div>
            <span className="text-xs bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full">
              {criticalQueue.length} requires action
            </span>
          </div>

          <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[420px]">
            {isLoading ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : criticalQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No critical or high priority incidents pending.
              </div>
            ) : (
              criticalQueue.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Active Civic Incidents</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/authority/incidents')}>
            View All Incidents →
          </Button>
        </div>
        {isLoading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No incidents currently reported in Rewa.
          </div>
        ) : (
          <IncidentTable incidents={incidents} />
        )}
      </div>
    </div>
  );
};
