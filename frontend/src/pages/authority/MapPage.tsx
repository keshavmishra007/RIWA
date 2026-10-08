import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CivicMap } from '../../components/map/CivicMap';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { incidentsApi, hotspotsApi } from '../../services/api';
import { PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import type { Incident, Hotspot } from '../../types';

export const MapPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadMapData = async () => {
      try {
        const [iData, hData] = await Promise.all([
          incidentsApi.getAll(),
          hotspotsApi.getAll(),
        ]);
        if (isMounted) {
          setIncidents(iData);
          setHotspots(hData);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMapData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (inc.status === 'CLOSED') return false;
    if ((inc.reportCount || 0) <= 0) return false;
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && inc.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-white border-b border-slate-200 p-4 flex gap-4 items-center shrink-0 flex-wrap">
        <h1 className="text-xl font-bold text-slate-900 mr-4">Live Civic Map</h1>
        <div className="flex gap-2">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="drainage">Drainage</option>
            <option value="garbage">Garbage</option>
            <option value="road_damage">Road Damage</option>
            <option value="electrical_hazard">Electrical</option>
            <option value="other">Other Civic Services</option>
          </select>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="ml-auto">
          <button
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4"/> : <PanelLeftOpen className="w-4 h-4"/>}
            {sidebarOpen ? 'Hide Panel' : 'Show Panel'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative">
          <CivicMap
            incidents={filteredIncidents}
            hotspots={hotspots}
            onIncidentClick={(id: string) => navigate(`/authority/incidents/${id}`)}
            showLegend={true}
          />
        </div>
        {sidebarOpen && (
          <div className="w-96 bg-slate-50 border-l border-slate-200 overflow-y-auto flex flex-col p-4 gap-4 z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Area Incidents</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {isLoading ? '...' : `${filteredIncidents.length} active`}
              </span>
            </div>
            {isLoading ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No active incidents in this area.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredIncidents.map((inc) => (
                  <IncidentCard key={inc.id} incident={inc} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
