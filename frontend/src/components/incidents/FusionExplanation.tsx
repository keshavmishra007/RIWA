import React from 'react';
import { Brain, CheckCircle2, XCircle } from 'lucide-react';
import type { FusionExplanation as FusionExplanationType } from '../../types';

export interface FusionExplanationProps {
  explanation: FusionExplanationType;
  reportCount: number;
}

export const FusionExplanation: React.FC<FusionExplanationProps> = ({ explanation, reportCount }) => {
  const toPercent = (v: number) => Math.round(v * 100);

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 70) return <CheckCircle2 className="text-green-500" size={16} />;
    if (score < 50) return <XCircle className="text-red-500" size={16} />;
    return null;
  };

  const renderBar = (label: string, rawScore: number) => {
    const score = toPercent(rawScore);
    return (
      <div className="mb-4 last:mb-0">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {getStatusIcon(score)}
          </div>
          <span className="text-sm font-bold text-slate-900">{score}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getProgressColor(score)} transition-all duration-1000`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  const confidencePercent = toPercent(explanation.confidence);

  return (
    <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Brain size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Why Were These Reports Grouped?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="space-y-1">
          {renderBar('Semantic Similarity', explanation.semanticScore)}
          {renderBar('Location Proximity', explanation.locationScore)}
          {renderBar('Time Proximity', explanation.timeScore)}
          {renderBar('Category Compatibility', explanation.categoryScore)}
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Fusion Confidence</span>
          <div className="text-5xl font-black text-slate-900 mb-2">
            {confidencePercent}%
          </div>
          <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full ${getProgressColor(confidencePercent)}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-600 font-medium">
            <span className="text-blue-600 font-bold">{reportCount}</span> reports were identified as likely describing the same civic incident.
          </p>
        </div>
      </div>
    </div>
  );
};
