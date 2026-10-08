import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ReportForm, type ReportFormData } from '../../components/citizen/ReportForm';
import { AIProcessingState } from '../../components/citizen/AIProcessingState';
import { SubmissionResult } from '../../components/citizen/SubmissionResult';
import { reportsApi } from '../../services/api';
import type { Complaint, Incident } from '../../types';

type PageState = 'form' | 'processing' | 'result';

export const ReportPage: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>('form');
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: ReportFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    setPageState('processing');

    try {
      let finalImageUrl: string | undefined = undefined;

      // 1. Upload image evidence first if a real file is attached
      if (formData.photoFile) {
        try {
          finalImageUrl = await reportsApi.uploadImage(formData.photoFile);
          console.log('✅ Evidence image uploaded successfully:', finalImageUrl);
        } catch (uploadErr: any) {
          console.error('Image upload failed:', uploadErr);
          throw new Error(
            uploadErr.response?.data?.error || 'Failed to upload photo evidence. Please try again.'
          );
        }
      } else if (formData.photoUrl) {
        finalImageUrl = formData.photoUrl;
      }

      // 2. Submit citizen report to backend pipeline
      const lat = formData.location?.lat ?? 24.534;
      const lng = formData.location?.lng ?? 81.2965;

      const response = await reportsApi.submit({
        description: formData.description,
        latitude: lat,
        longitude: lng,
        imageUrl: finalImageUrl,
      });

      if (response && response.success) {
        setSubmittedIncident(response.incident);
        setSubmittedComplaint(response.complaint);
        setPageState('result');
      } else {
        throw new Error('Report processing could not be completed.');
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to submit report. Please check connection.';
      setErrorMessage(msg);
      setPageState('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      {errorMessage && pageState === 'form' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <h4 className="text-sm font-semibold">Submission Error</h4>
            <p className="text-sm mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {pageState === 'form' && (
        <ReportForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}

      {pageState === 'processing' && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <AIProcessingState />
        </div>
      )}

      {pageState === 'result' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <SubmissionResult
            incident={submittedIncident || undefined}
            complaint={submittedComplaint || undefined}
          />
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate('/citizen/reports')}
              className="text-[#2563EB] hover:text-[#1D4ED8] text-sm font-medium transition-colors"
            >
              View My Reports
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => navigate('/citizen/dashboard')}
              className="text-[#64748B] hover:text-[#0F172A] text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
