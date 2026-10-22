import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import type { Incident } from '../../types';
import { incidentsApi } from '../../services/api';

const SEVEN_DEPARTMENTS = [
  {
    name: 'Municipal Engineering',
    code: 'municipal_engineering',
    description: 'Drains, sewer overflow, waterlogging, standing water',
  },
  {
    name: 'Sanitation',
    code: 'sanitation',
    description: 'Garbage dumps, overflowing bins, uncollected waste, litter',
  },
  {
    name: 'Public Works',
    code: 'public_works',
    description: 'Potholes, broken roads, damaged tarmac, cave-ins',
  },
  {
    name: 'Electrical',
    code: 'electrical',
    description: 'Broken streetlights, hanging power lines, sparking wires',
  },
  {
    name: 'Animal Control',
    code: 'animal_control',
    description: 'Stray cows, cattle roaming, animals obstructing roads, injured animals',
  },
  {
    name: 'Traffic Police',
    code: 'traffic_police',
    description: 'Traffic jams, signal failures, road obstruction, illegal parking',
  },
  {
    name: 'Other Civic Services',
    code: 'other_civic_services',
    description: 'Miscellaneous civic amenities, cross-department & general complaints',
  },
];

interface DepartmentControlProps {
  incidentId: string;
  currentDepartmentName?: string;
  currentDepartmentId?: string;
  aiRecommendedDepartment?: string;
  supportingDepartment?: string;
  needsHumanReview?: boolean;
  onDepartmentAssigned: (updatedIncident: Incident) => void;
}

export const DepartmentControl: React.FC<DepartmentControlProps> = ({
  incidentId,
  currentDepartmentName,
  aiRecommendedDepartment,
  supportingDepartment,
  needsHumanReview,
  onDepartmentAssigned,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(
    currentDepartmentName && currentDepartmentName !== 'Unassigned'
      ? currentDepartmentName
      : aiRecommendedDepartment || 'Municipal Engineering'
  );
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isUnassigned = !currentDepartmentName || currentDepartmentName === 'Unassigned';

  const handleReassign = async (deptToAssign?: string) => {
    const targetDept = deptToAssign || selectedDept;
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const auditNote =
        note.trim() ||
        (isUnassigned
          ? `Initial assignment to ${targetDept} by Authority Officer`
          : `Department reassigned from ${currentDepartmentName} to ${targetDept} by Authority Officer`);

      const updated = await incidentsApi.assignDepartment(
        incidentId,
        targetDept,
        undefined,
        auditNote
      );

      setSuccessMessage(`Successfully routed to ${targetDept}`);
      onDepartmentAssigned(updated);
      setIsOpen(false);
      setNote('');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to assign department:', err);
      alert('Failed to reassign department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAi = () => {
    if (aiRecommendedDepartment) {
      setSelectedDept(aiRecommendedDepartment);
      handleReassign(aiRecommendedDepartment);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Department Queue Assignment</span>
        </h3>
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors"
        >
          {isUnassigned ? 'Assign Department' : 'Reassign'}
        </button>
      </div>

      {/* Current Assignment Badge */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
        <span className="text-xs text-slate-500 font-medium">Currently Assigned:</span>
        {isUnassigned ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Unassigned / Needs Routing
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-900 border border-purple-200">
            <Building2 className="w-3 h-3 text-purple-700" />
            {currentDepartmentName}
          </span>
        )}
      </div>

      {/* AI Recommendation Box */}
      {aiRecommendedDepartment && (
        <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              AI Routing Recommendation
            </span>
            {needsHumanReview && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Review Advised
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-800 font-semibold">
              {aiRecommendedDepartment}
              {supportingDepartment && (
                <span className="text-slate-500 font-normal text-[11px] block">
                  Supporting: <strong>{supportingDepartment}</strong>
                </span>
              )}
            </div>

            {(isUnassigned ||
              (currentDepartmentName &&
                currentDepartmentName.toLowerCase() !== aiRecommendedDepartment.toLowerCase())) && (
              <button
                onClick={handleAcceptAi}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Accept AI
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Reassign Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {isUnassigned ? 'Assign Incident to Department' : 'Reassign Incident Department'}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 mb-4">
              Select one of the 7 municipal departments to route this incident. This will immediately
              update the department queue and log an audit trail entry.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {SEVEN_DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept.toLowerCase() === dept.name.toLowerCase();
                const isAiPick =
                  aiRecommendedDepartment &&
                  aiRecommendedDepartment.toLowerCase() === dept.name.toLowerCase();

                return (
                  <div
                    key={dept.name}
                    onClick={() => setSelectedDept(dept.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {dept.name}
                        </span>
                        {isAiPick && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">
                            <Sparkles className="w-2.5 h-2.5" /> AI Pick
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{dept.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Audit Log Reason / Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`e.g. Reassigned to ${selectedDept} for field dispatch`}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReassign()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Routing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
