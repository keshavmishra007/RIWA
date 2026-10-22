import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Building2,
  Droplets,
  Trash2,
  HardHat,
  Zap,
  PawPrint,
  Car,
  ShieldAlert,
} from 'lucide-react';
import { departmentsApi, incidentsApi } from '../../services/api';

interface DepartmentMeta {
  code: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  description: string;
}

const DEPARTMENT_METADATA: Record<string, DepartmentMeta> = {
  municipal_engineering: {
    code: 'municipal_engineering',
    name: 'Municipal Engineering',
    icon: Droplets,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-100',
    badgeColor: 'text-cyan-800',
    description: 'Blocked drains, sewer overflows, waterlogging, standing water & flood prevention.',
  },
  sanitation: {
    code: 'sanitation',
    name: 'Sanitation',
    icon: Trash2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeColor: 'text-emerald-800',
    description: 'Garbage dumps, overflowing dumpsters, uncollected waste, litter & public cleanliness.',
  },
  public_works: {
    code: 'public_works',
    name: 'Public Works',
    icon: HardHat,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeColor: 'text-amber-800',
    description: 'Potholes, broken roads, damaged tarmac, trenches, cave-ins & pavement repairs.',
  },
  electrical: {
    code: 'electrical',
    name: 'Electrical',
    icon: Zap,
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    badgeBg: 'bg-yellow-100',
    badgeColor: 'text-yellow-800',
    description: 'Broken streetlights, hanging power lines, sparking wires & electrical infrastructure.',
  },
  animal_control: {
    code: 'animal_control',
    name: 'Animal Control',
    icon: PawPrint,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeColor: 'text-orange-800',
    description: 'Stray cows, cattle roaming roads, sick/injured animals & public animal obstruction.',
  },
  traffic_police: {
    code: 'traffic_police',
    name: 'Traffic Police',
    icon: Car,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-100',
    badgeColor: 'text-indigo-800',
    description: 'Traffic congestion, signal light failures, gridlock, illegal parking & obstruction.',
  },
  other_civic_services: {
    code: 'other_civic_services',
    name: 'Other Civic Services',
    icon: Building2,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    badgeBg: 'bg-slate-200',
    badgeColor: 'text-slate-800',
    description: 'Miscellaneous civic amenities, multi-department complaints & unclassified issues.',
  },
};

const getDepartmentKey = (name: string, code?: string): string => {
  const norm = (code || name || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (norm.includes('municipal') || norm.includes('drainage')) return 'municipal_engineering';
  if (norm.includes('sanitation') || norm.includes('garbage')) return 'sanitation';
  if (norm.includes('public_work') || norm.includes('pwd') || norm.includes('road')) return 'public_works';
  if (norm.includes('electrical') || norm.includes('bijli')) return 'electrical';
  if (norm.includes('animal') || norm.includes('cattle')) return 'animal_control';
  if (norm.includes('traffic')) return 'traffic_police';
  return 'other_civic_services';
};

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [unassignedCount, setUnassignedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [deptData, unassignedData] = await Promise.all([
          departmentsApi.getAll(),
          incidentsApi.getAll({ department: 'unassigned' }),
        ]);

        if (isMounted) {
          setDepartments(deptData || []);
          setUnassignedCount(Array.isArray(unassignedData) ? unassignedData.length : 0);
        }
      } catch (err) {
        console.error('Failed to load departments data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDepartmentClick = (dept: any) => {
    const filterParam = dept.code || dept.name;
    navigate(`/authority/incidents?department=${encodeURIComponent(filterParam)}`);
  };

  const handleUnassignedClick = () => {
    navigate('/authority/incidents?department=unassigned');
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Municipal Departments</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              7 Core Units
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Live operational workload, automated AI routing, and department-wise queue management for Rewa
          </p>
        </div>
      </header>

      {/* Unassigned / Needs Routing Queue Banner */}
      <div
        onClick={handleUnassignedClick}
        className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          unassignedCount > 0
            ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
            : 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              unassignedCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {unassignedCount > 0 ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-lg">Unassigned / Needs Routing Queue</h2>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  unassignedCount > 0
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {unassignedCount} Incident{unassignedCount === 1 ? '' : 's'} Pending
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {unassignedCount > 0
                ? 'Incidents not yet assigned to an operational department. Authorities can review AI routing suggestions and dispatch immediately.'
                : 'All current civic incidents have been successfully routed to operational municipal departments.'}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUnassignedClick();
          }}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
            unassignedCount > 0
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          <span>{unassignedCount > 0 ? 'Review Unassigned Queue' : 'View Unassigned (0)'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading department workloads from Supabase...</span>
        </div>
      ) : departments.length === 0 ? (
        <div className="p-12 bg-white rounded-lg border border-slate-200 text-center text-slate-500">
          No departments configured in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const metaKey = getDepartmentKey(dept.name, dept.code);
            const meta = DEPARTMENT_METADATA[metaKey] || DEPARTMENT_METADATA.other_civic_services;
            const IconComponent = meta.icon;

            return (
              <div
                key={dept.id || dept.code || dept.name}
                onClick={() => handleDepartmentClick(dept)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl ${meta.iconBg} ${meta.iconColor} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                          {dept.name}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {dept.description || meta.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-2 gap-3 bg-slate-50/50">
                  <div className="flex flex-col bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 mb-1 flex items-center font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-blue-500" /> Active
                    </span>
                    <span className="font-bold text-slate-900 text-2xl">{dept.activeIncidents ?? 0}</span>
                  </div>
                  <div className="flex flex-col bg-white p-3 rounded-lg border border-red-200 shadow-xs">
                    <span className="text-xs text-red-600 mb-1 flex items-center font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Critical
                    </span>
                    <span className="font-bold text-red-600 text-2xl">{dept.criticalIncidents ?? 0}</span>
                  </div>
                  <div className="flex flex-col bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 mb-1 flex items-center font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1 text-orange-500" /> Pending
                    </span>
                    <span className="font-bold text-slate-900 text-2xl">{dept.pendingIncidents ?? 0}</span>
                  </div>
                  <div className="flex flex-col bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 mb-1 flex items-center font-medium">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" /> Resolved
                    </span>
                    <span className="font-bold text-slate-900 text-2xl">{dept.resolvedIncidents ?? 0}</span>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    {(dept.activeIncidents ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        Active Operational Queue
                      </span>
                    ) : (
                      'Queue Clear'
                    )}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    <span>View Queue</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
