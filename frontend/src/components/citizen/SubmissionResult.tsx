import React from 'react';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Complaint, Incident } from '../../types';

interface SubmissionResultProps {
  complaint?: Complaint;
  incident?: Incident;
}

export const SubmissionResult: React.FC<SubmissionResultProps> = ({ complaint: _complaint, incident }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-[#16A34A]" />
      </div>
      
      <h2 className="text-2xl font-bold text-[#0F172A] mb-2">REPORT RECEIVED</h2>
      <p className="text-[#475569] mb-8">Thank you for submitting your report. Our AI has processed it successfully.</p>
      
      {incident && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-5 mb-8 text-left">
          <p className="text-sm font-medium text-[#475569] mb-3 flex items-center">
            Your report has been connected to:
          </p>
          <div className="bg-white p-4 rounded border border-[#E2E8F0]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded">
                {incident.id || 'INC-001'}
              </span>
              <span className="text-xs font-bold text-[#DC2626] bg-red-50 px-2 py-1 rounded flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {incident.priority || 'High'}
              </span>
            </div>
            <h3 className="font-semibold text-[#0F172A] text-sm mb-1">{incident.title}</h3>
            <p className="text-xs text-[#64748B]">
              Joined {incident.reportCount || 5} other reports
            </p>
          </div>
        </div>
      )}
      
      <button className="inline-flex items-center px-6 py-3 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors">
        Track Incident <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
};
