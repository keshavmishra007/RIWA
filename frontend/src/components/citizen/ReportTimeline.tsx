import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ReportTimelineProps {
  currentStep: number;
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({ currentStep }) => {
  const steps = [
    'Report Submitted',
    'AI Processed',
    'Related Reports Identified',
    'Assigned to Department',
    'Response in Progress',
    'Resolved'
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8F0]">
      <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Status Timeline</h3>
      <div className="relative border-l-2 border-[#E2E8F0] ml-3 space-y-6">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="relative pl-6">
              {isCompleted ? (
                <div className="absolute -left-[11px] top-0 bg-white">
                  <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                </div>
              ) : isCurrent ? (
                <div className="absolute -left-[11px] top-0 bg-white">
                  <div className="w-5 h-5 rounded-full border-2 border-[#2563EB] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="absolute -left-[11px] top-0 bg-white">
                  <Circle className="w-5 h-5 text-[#CBD5E1]" />
                </div>
              )}
              
              <div>
                <p className={`text-sm font-medium ${isCompleted ? 'text-[#0F172A]' : isCurrent ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                  {step}
                </p>
                {isCurrent && (
                  <p className="text-xs text-[#64748B] mt-1">Currently in progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
