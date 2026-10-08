import React from 'react';
import { Sparkles, BarChart2, Activity, Map, Hash } from 'lucide-react';
import type { Incident } from '../../types';

interface IncidentBriefProps {
  incident: Incident;
}

export const IncidentBrief: React.FC<IncidentBriefProps> = ({ incident }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-cyan-500 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-cyan-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-900">AI Incident Brief</h2>
        </div>
        <p className="text-slate-700 leading-relaxed text-sm">
          {incident.aiBrief || 'Based on incoming reports, this incident involves widespread disruption. Multiple citizens have reported issues in the surrounding area within the last few hours, suggesting an escalating situation.'}
        </p>
      </div>
      
      <div className="grid grid-cols-4 divide-x divide-slate-100 bg-white">
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Hash size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Reports</span>
          </div>
          <span className="text-xl font-bold text-slate-900">{incident.reportCount}</span>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Map size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Area</span>
          </div>
          <span className="text-xl font-bold text-slate-900">1.2 km²</span>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Activity size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Growth</span>
          </div>
          <span className="text-xl font-bold text-amber-600">High</span>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <BarChart2 size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Confidence</span>
          </div>
          <span className="text-xl font-bold text-cyan-600">92%</span>
        </div>
      </div>
    </div>
  );
};
