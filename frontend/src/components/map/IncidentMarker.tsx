import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Incident } from '../../types';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface IncidentMarkerProps {
  incident: Incident;
  onClick: (id: string) => void;
  isSelected?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return '#DC2626';
    case 'HIGH': return '#F59E0B';
    case 'MEDIUM': return '#2563EB';
    case 'LOW': return '#16A34A';
    default: return '#64748B';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <ChevronUp size={16} className="text-red-500" />;
    case 'down': return <ChevronDown size={16} className="text-green-500" />;
    default: return <Minus size={16} className="text-slate-400" />;
  }
};

export const IncidentMarker: React.FC<IncidentMarkerProps> = ({ incident, onClick, isSelected }) => {
  const color = getPriorityColor(incident.priority);
  const isCritical = incident.priority === 'CRITICAL';
  const borderStyle = isSelected ? 'border: 3px solid #2563EB; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4);' : 'border: 2px solid white;';
  
  const markerHtml = `
    <div class="relative flex items-center justify-center w-8 h-8">
      ${isCritical ? `<div class="absolute w-12 h-12 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>` : ''}
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-md text-white font-bold text-xs" style="background-color: ${color}; ${borderStyle}">
        ${incident.reportCount}
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: markerHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  return (
    <Marker 
      position={[incident.latitude, incident.longitude]} 
      icon={customIcon}
      eventHandlers={{
        click: () => onClick(incident.id)
      }}
    >
      <Popup>
        <div className="p-1 min-w-[200px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-slate-800 text-base m-0 leading-tight">{incident.title}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
              {incident.priority}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-3">{formatDate(incident.updatedAt)}</p>
          
          <div className="flex justify-between items-center mb-3 p-2 bg-slate-50 rounded-md border border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase font-semibold">Reports</div>
              <div className="text-lg font-bold text-slate-800">{incident.reportCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase font-semibold">Trend</div>
              <div className="flex items-center justify-center mt-1">
                {getTrendIcon(incident.trend)}
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick(incident.id);
            }}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
};
