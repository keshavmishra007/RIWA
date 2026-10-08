import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-slate-200 text-sm">
      <h4 className="font-semibold text-slate-800 mb-3">Map Legend</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_0_4px_rgba(220,38,38,0.2)]"></div>
          <span className="text-slate-600">Critical Incident</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-slate-600">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-slate-600">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span className="text-slate-600">Low Priority</span>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200">
          <div className="w-4 h-4 rounded-full border-2 border-dashed border-red-500 bg-red-500/10"></div>
          <span className="text-slate-600">Hotspot Zone</span>
        </div>
      </div>
    </div>
  );
};
