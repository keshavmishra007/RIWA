import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import type { Complaint, Incident } from '../../types';

interface SubmissionResultProps {
  complaint?: Complaint;
  incident?: Incident;
}

export const SubmissionResult: React.FC<SubmissionResultProps> = ({ complaint, incident }) => {
  const navigate = useNavigate();
  const isPendingReview = !incident;
  const reportCode = complaint?.complaintCode || complaint?.id;

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
      <div className={`w-16 h-16 ${isPendingReview ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-[#16A34A]'} rounded-full flex items-center justify-center mx-auto mb-6`}>
        {isPendingReview ? <Clock className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
      </div>
      
      <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
        {isPendingReview ? 'REPORT RECORDED' : 'REPORT RECEIVED'}
      </h2>
      <p className="text-[#475569] mb-6">
        {isPendingReview
          ? `Report ${reportCode || ''} has been safely recorded and queued for municipal authority review.`
          : 'Thank you for submitting your report. Our AI has processed it successfully.'}
      </p>
      
      {incident ? (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-5 mb-8 text-left">
          <p className="text-sm font-medium text-[#475569] mb-3 flex items-center">
            Your report has been connected to:
          </p>
          <div className="bg-white p-4 rounded border border-[#E2E8F0]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded">
                {incident.incidentCode || incident.id}
              </span>
              <span className="text-xs font-bold text-[#DC2626] bg-red-50 px-2 py-1 rounded flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {incident.priority || 'Medium'}
              </span>
            </div>
            <h3 className="font-semibold text-[#0F172A] text-sm mb-1">{incident.title}</h3>
            <p className="text-xs text-[#64748B]">
              Joined {incident.reportCount || 1} report{(incident.reportCount || 1) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 mb-8 text-left space-y-1">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Verification Queue</h4>
          <p className="text-xs text-amber-800">
            Municipal engineering teams review and route new citizen submissions in real time. Your evidence and location are safely preserved.
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {complaint?.id && (
          <button
            onClick={() => navigate(`/citizen/reports/${complaint.id}`)}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            Track Report <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
        {incident?.id && (
          <button
            onClick={() => navigate(`/authority/incidents/${incident.id}`)}
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            View Incident
          </button>
        )}
      </div>
    </div>
  );
};
