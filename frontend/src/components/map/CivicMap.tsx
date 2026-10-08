import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident, Hotspot } from '../../types';
import { REWA_MAP_CENTER, REWA_MAP_ZOOM } from '../../data/mockData';
import { IncidentMarker } from './IncidentMarker';
import { HotspotOverlay } from './HotspotOverlay';
import { MapLegend } from './MapLegend';

// Fix Leaflet default icon bug
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface CivicMapProps {
  incidents: Incident[];
  hotspots?: Hotspot[];
  onIncidentClick?: (id: string) => void;
  selectedIncidentId?: string;
  height?: string;
  showLegend?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({ 
  incidents, 
  hotspots = [], 
  onIncidentClick, 
  selectedIncidentId,
  height = '100%',
  showLegend = true
}) => {
  return (
    <div style={{ height, width: '100%', position: 'relative' }} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer 
        center={REWA_MAP_CENTER} 
        zoom={REWA_MAP_ZOOM} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hotspots.map((hotspot) => (
          <HotspotOverlay key={hotspot.id} hotspot={hotspot} />
        ))}

        {incidents
          .filter((incident) => incident.status !== 'CLOSED' && (incident.reportCount ?? 0) > 0)
          .map((incident) => (
            <IncidentMarker 
              key={incident.id} 
              incident={incident} 
              onClick={onIncidentClick || (() => {})}
              isSelected={selectedIncidentId === incident.id}
            />
        ))}
      </MapContainer>
      
      {showLegend && <MapLegend />}
    </div>
  );
};
