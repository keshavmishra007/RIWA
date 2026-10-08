import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import type { Hotspot } from '../../types';

interface HotspotOverlayProps {
  hotspot: Hotspot;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return '#DC2626';
    case 'HIGH': return '#EF4444';
    case 'MEDIUM': return '#F59E0B';
    case 'LOW': return '#EAB308';
    default: return '#3B82F6';
  }
};

export const HotspotOverlay: React.FC<HotspotOverlayProps> = ({ hotspot }) => {
  const color = getSeverityColor(hotspot.severity);
  
  return (
    <Circle
      center={[hotspot.latitude, hotspot.longitude]}
      pathOptions={{ 
        fillColor: color, 
        fillOpacity: 0.2, 
        color: color, 
        weight: 2,
        dashArray: '5, 5'
      }}
      radius={hotspot.radius}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-semibold text-slate-800 m-0 mb-1">{hotspot.label}</h3>
          <p className="text-sm text-slate-600 mb-2">{hotspot.reportCount} reports · {hotspot.incidentCount} incidents</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {hotspot.severity}
            </span>
            <span className="text-xs text-slate-500">
              Radius: {hotspot.radius}m
            </span>
          </div>
        </div>
      </Popup>
    </Circle>
  );
};
