import React from 'react';
import { Lightbulb, AlertTriangle, Check, Edit2 } from 'lucide-react';

interface RecommendedActionProps {
  actions: string[];
  department?: string;
  onAccept?: () => void;
  onModify?: () => void;
}

export const RecommendedAction: React.FC<RecommendedActionProps> = ({
  actions,
  department,
  onAccept,
  onModify
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="text-amber-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-900">AI Recommended Response</h2>
        </div>

        <div className="space-y-3 mb-6">
          {actions.map((action, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                {index + 1}
              </div>
              <p className="text-sm text-slate-700">{action}</p>
            </div>
          ))}
        </div>

        {department && (
          <p className="text-sm text-slate-500 mb-4">
            Recommended department: <span className="font-medium text-slate-700">{department}</span>
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Check size={16} />
            Accept & Assign
          </button>
          <button
            onClick={onModify}
            className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Edit2 size={16} />
            Modify
          </button>
        </div>
      </div>

      <div className="bg-amber-50 p-3 border-t border-amber-100 flex items-start gap-2 text-amber-800">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <p className="text-xs font-medium leading-relaxed">
          AI recommendation · Human authorization required before execution
        </p>
      </div>
    </div>
  );
};
