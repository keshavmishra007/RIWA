import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, ArrowRight } from 'lucide-react';
import { CivicMap } from '../../components/map/CivicMap';
import { hotspotsApi, incidentsApi } from '../../services/api';
import type { Hotspot, Incident } from '../../types';

export const HotspotsPage: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [hData, iData] = await Promise.all([
          hotspotsApi.getAll(),
          incidentsApi.getAll(),
        ]);
        if (isMounted) {
          setHotspots(hData);
          setIncidents(iData);
        }
      } catch (err) {
        console.error('Failed to load hotspots:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHotspots = hotspots.filter((h) => {
    if (categoryFilter === 'ALL') return true;
    return h.category === categoryFilter;
  });

  const handleCardClick = (hotspot: Hotspot) => {
    const targetId = hotspot.incidentId || (hotspot.id.startsWith('hs-') ? hotspot.id.replace('hs-', '') : hotspot.id);
    navigate(`/authority/incidents/${targetId}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Civic Hotspots & Impact Clusters</h1>
          <p className="text-sm text-slate-500">Live geospatial clustering derived from verified citizen reports</p>
        </div>
        <div className="flex gap-3">
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
        </div>
      </header>

      <div className="flex flex-1 gap-6 min-h-0 flex-col lg:flex-row">
        {/* Map visualization */}
        <div className="w-full lg:w-3/5 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-72 lg:h-auto">
          <div className="flex-1">
            <CivicMap
              incidents={incidents.filter((i) => i.status !== 'CLOSED' && (i.reportCount || 0) > 0)}
              hotspots={filteredHotspots}
              onIncidentClick={(id: string) => navigate(`/authority/incidents/${id}`)}
              showLegend
            />
          </div>
        </div>
        
        {/* Hotspots Card List */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white rounded-lg border border-slate-200">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm">Calculating active hotspots...</span>
            </div>
          ) : filteredHotspots.length === 0 ? (
            <div className="p-8 bg-white rounded-lg border border-slate-200 text-center space-y-2 text-slate-500">
              <p className="font-semibold text-slate-700">No dense hotspot clusters found</p>
              <p className="text-sm">
                Single civic incidents are currently being monitored individually on the map without anomalous concentration.
              </p>
            </div>
          ) : (
            filteredHotspots.map((hotspot) => (
              <div 
                key={hotspot.id} 
                onClick={() => handleCardClick(hotspot)}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>{hotspot.label}</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium uppercase">
                    {hotspot.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm p-3 bg-slate-50 rounded-md border border-slate-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 text-xs">Clustered Reports</span>
                    <span className="font-bold text-slate-900 text-base">{hotspot.reportCount}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 text-xs">Severity</span>
                    <span className={`font-bold text-base ${
                      hotspot.severity === 'CRITICAL' ? 'text-red-600' : hotspot.severity === 'HIGH' ? 'text-orange-500' : 'text-blue-600'
                    }`}>
                      {hotspot.severity}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 text-xs">Radius</span>
                    <span className="font-medium text-slate-800 text-base">
                      {hotspot.radius}m
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:underline">
                  <span>View Incident Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
