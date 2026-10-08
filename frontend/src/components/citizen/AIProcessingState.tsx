import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Circle } from 'lucide-react';

export const AIProcessingState: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000), // Understanding issue
      setTimeout(() => setStep(2), 2000), // Checking location
      setTimeout(() => setStep(3), 3000), // Finding related reports
      setTimeout(() => setStep(4), 4000), // Creating civic incident
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { id: 1, label: 'Understanding issue' },
    { id: 2, label: 'Checking location' },
    { id: 3, label: 'Finding related reports' },
    { id: 4, label: 'Creating civic incident' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-[#0F172A] mb-6">Analyzing your report...</h2>
      
      <div className="space-y-4 text-left px-4">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center">
            {step >= s.id ? (
              <CheckCircle className="w-5 h-5 text-[#16A34A] mr-3 shrink-0" />
            ) : step === s.id - 1 ? (
              <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin mr-3 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-[#CBD5E1] mr-3 shrink-0" />
            )}
            <span className={`text-sm font-medium ${step >= s.id ? 'text-[#0F172A]' : step === s.id - 1 ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
