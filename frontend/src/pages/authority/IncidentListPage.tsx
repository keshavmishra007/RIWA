import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  List as ListIcon,
  Filter,
  Search,
  Loader2,
  Building2,
  X,
  ShieldAlert,
} from 'lucide-react';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { incidentsApi } from '../../services/api';
import type { Incident } from '../../types';

const DEPARTMENT_LABELS: Record<string, string> = {
  municipal_engineering: 'Municipal Engineering',
  sanitation: 'Sanitation',
  public_works: 'Public Works',
  electrical: 'Electrical',
  animal_control: 'Animal Control',
  traffic_police: 'Traffic Police',
  other_civic_services: 'Other Civic Services',
  unassigned: 'Unassigned / Needs Routing',
};

export const IncidentListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Department filter initialized from URL search params
  const initialDept = searchParams.get('department') || searchParams.get('departmentId') || 'ALL';
  const [departmentFilter, setDepartmentFilter] = useState(initialDept);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep state in sync if URL search params change
  useEffect(() => {
    const urlDept = searchParams.get('department') || searchParams.get('departmentId') || 'ALL';
    if (urlDept !== departmentFilter) {
      setDepartmentFilter(urlDept);
    }
  }, [searchParams]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await incidentsApi.getAll({
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        status: statusFilter,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      });
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [departmentFilter, categoryFilter, priorityFilter, statusFilter]);

  const handleDepartmentChange = (val: string) => {
    setDepartmentFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'ALL') {
      newParams.delete('department');
      newParams.delete('departmentId');
    } else {
      newParams.set('department', val);
      newParams.delete('departmentId');
    }
    setSearchParams(newParams);
  };

  const clearDepartmentFilter = () => {
    handleDepartmentChange('ALL');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIncidents();
  };

  const handleIncidentSelect = (incident: Incident) => {
    navigate(`/authority/incidents/${incident.id}`);
  };

  const activeDepartmentDisplayName =
    DEPARTMENT_LABELS[departmentFilter.toLowerCase()] ||
    departmentFilter.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incident Command Queue</h1>
          <p className="text-sm text-slate-500">Live civic incidents fused from citizen reports across Rewa</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            className={`p-2 rounded-md transition-all ${
              viewMode === 'table' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Active Department Queue Banner */}
      {departmentFilter !== 'ALL' && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            departmentFilter.toLowerCase() === 'unassigned'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                departmentFilter.toLowerCase() === 'unassigned'
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-blue-200 text-blue-800'
              }`}
            >
              {departmentFilter.toLowerCase() === 'unassigned' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Department Queue
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    departmentFilter.toLowerCase() === 'unassigned'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  {incidents.length} Incident{incidents.length === 1 ? '' : 's'}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {activeDepartmentDisplayName}
              </h2>
            </div>
          </div>
          <button
            onClick={clearDepartmentFilter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Queue Filter</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter className="w-5 h-5 text-slate-400 shrink-0" />

        {/* Department Filter Dropdown */}
        <select
          value={departmentFilter}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          className={`border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            departmentFilter !== 'ALL'
              ? 'border-blue-400 bg-blue-50/50 text-blue-900'
              : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          <option value="ALL">Department: All (7 Departments)</option>
          <option value="unassigned">⚠️ Unassigned / Needs Routing</option>
          <option value="Municipal Engineering">Municipal Engineering</option>
          <option value="Sanitation">Sanitation</option>
          <option value="Public Works">Public Works</option>
          <option value="Electrical">Electrical</option>
          <option value="Animal Control">Animal Control</option>
          <option value="Traffic Police">Traffic Police</option>
          <option value="Other Civic Services">Other Civic Services</option>
        </select>

        {/* Category Filter */}
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="ALL">Category: All</option>
          <option value="drainage">Drainage</option>
          <option value="garbage">Garbage</option>
          <option value="road_damage">Road Damage</option>
          <option value="electrical_hazard">Electrical</option>
          <option value="other">Other Civic Services</option>
        </select>

        {/* Priority Filter */}
        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="ALL">Priority: All</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Status Filter */}
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="ALL">Status: All</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center gap-2 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents by keyword or location..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm font-semibold">Loading live operational queue...</span>
        </div>
      ) : incidents.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-900 text-lg">
            No incidents currently in {activeDepartmentDisplayName}
          </p>
          <p className="text-sm max-w-md mx-auto text-slate-500">
            {departmentFilter !== 'ALL'
              ? 'There are no active incidents matching this department filter. You can switch to another department or clear the queue filter.'
              : 'Try adjusting your filters or search terms.'}
          </p>
          {departmentFilter !== 'ALL' && (
            <button
              onClick={clearDepartmentFilter}
              className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Incidents
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <IncidentTable incidents={incidents} onRowClick={handleIncidentSelect} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} onClick={handleIncidentSelect} />
          ))}
        </div>
      )}
    </div>
  );
};
