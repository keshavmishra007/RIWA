import React, { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import type { IncidentStatus } from '../../types';
import { STATUS_CONFIG } from '../../utils/helpers';

interface StatusControlProps {
  currentStatus: IncidentStatus;
  onStatusChange: (newStatus: IncidentStatus, notes?: string) => void;
}

export const StatusControl: React.FC<StatusControlProps> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<IncidentStatus | null>(null);
  const [notes, setNotes] = useState('');

  const statuses: IncidentStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED'];

  const handleSelect = (status: IncidentStatus) => {
    if (status === currentStatus) {
      setIsOpen(false);
      return;
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      setPendingStatus(status);
      setShowConfirm(true);
      setIsOpen(false);
    } else {
      onStatusChange(status);
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    if (pendingStatus) {
      onStatusChange(pendingStatus, notes);
      setShowConfirm(false);
      setPendingStatus(null);
      setNotes('');
    }
  };

  const config = STATUS_CONFIG[currentStatus] || { label: currentStatus, bg: 'bg-slate-100', color: 'text-slate-800' };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex justify-between items-center w-40 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 shadow-sm bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
        >
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 focus:outline-none py-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 transition-colors ${
                  status === currentStatus ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-700'
                }`}
              >
                {STATUS_CONFIG[status]?.label || status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertCircle size={24} />
              <h3 className="text-lg font-semibold text-slate-900">Confirm Status Change</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              You are about to change the incident status to <span className="font-bold">{STATUS_CONFIG[pendingStatus || 'OPEN']?.label}</span>. 
              This may trigger automated notifications to affected citizens.
            </p>
            
            <div className="mb-5">
              <label htmlFor="status-notes" className="block text-sm font-medium text-slate-700 mb-1">
                Resolution Notes (Optional)
              </label>
              <textarea
                id="status-notes"
                rows={3}
                className="w-full border border-slate-300 rounded-lg shadow-sm p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Briefly explain how this was resolved..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingStatus(null);
                  setNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
