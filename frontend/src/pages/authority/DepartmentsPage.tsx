import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, ChevronRight, Loader2, Building2 } from 'lucide-react';
import { departmentsApi } from '../../services/api';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchDepartments = async () => {
      try {
        const data = await departmentsApi.getAll();
        if (isMounted) setDepartments(data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Municipal Departments</h1>
        <p className="text-sm text-slate-500">Live operational workload and incident assignment tracking</p>
      </header>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm">Loading department workloads from Supabase...</span>
        </div>
      ) : departments.length === 0 ? (
        <div className="p-12 bg-white rounded-lg border border-slate-200 text-center text-slate-500">
          No departments configured.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 text-lg">{dept.name}</h2>
                    <p className="text-sm text-slate-500">{dept.activeIncidents} Active Incidents</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 grid grid-cols-2 gap-4 bg-slate-50/50">
                <div className="flex flex-col bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 mb-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 text-blue-500"/> Active
                  </span>
                  <span className="font-bold text-slate-900 text-xl">{dept.activeIncidents}</span>
                </div>
                <div className="flex flex-col bg-white p-3 rounded-md border border-red-100 shadow-sm">
                  <span className="text-xs text-slate-500 mb-1 flex items-center text-red-600">
                    <AlertTriangle className="w-3 h-3 mr-1"/> Critical
                  </span>
                  <span className="font-bold text-red-600 text-xl">{dept.criticalIncidents}</span>
                </div>
                <div className="flex flex-col bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 mb-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-orange-500"/> Pending
                  </span>
                  <span className="font-bold text-slate-900 text-xl">{dept.pendingIncidents}</span>
                </div>
                <div className="flex flex-col bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 mb-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500"/> Resolved
                  </span>
                  <span className="font-bold text-slate-900 text-xl">{dept.resolvedIncidents}</span>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="text-xs font-medium text-slate-700">
                    {dept.activeIncidents > 0 ? 'Active Queue' : 'No Active Queue'}
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/authority/incidents')}
                  className="w-full mt-2 py-2 flex items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                >
                  View Assigned Incidents
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
