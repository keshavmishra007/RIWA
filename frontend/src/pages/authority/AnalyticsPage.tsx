import React from 'react';
import { KPICard } from '../../components/ui/KPICard';
import { CategoryChart } from '../../components/analytics/CategoryChart';
import { TrendChart } from '../../components/analytics/TrendChart';
import { PriorityChart } from '../../components/analytics/PriorityChart';
import { DepartmentWorkloadChart } from '../../components/analytics/DepartmentWorkloadChart';
import { MOCK_ANALYTICS } from '../../data/mockData';
import { FileText, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Insights</h1>
        <p className="text-sm text-slate-500">City-wide intelligence and performance metrics</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Total Reports" 
          value={MOCK_ANALYTICS.totalReports.toString()} 
          icon={<FileText className="w-5 h-5 text-blue-600"/>} 
          change={{ value: "+12% vs last month", trend: "up" }} 
        />
        <KPICard 
          label="Active Incidents" 
          value={MOCK_ANALYTICS.activeIncidents.toString()} 
          icon={<AlertCircle className="w-5 h-5 text-orange-500"/>} 
          change={{ value: "-5% vs last month", trend: "down" }} 
        />
        <KPICard 
          label="Avg Response Time" 
          value={MOCK_ANALYTICS.avgResponseTime} 
          icon={<Clock className="w-5 h-5 text-purple-600"/>} 
          change={{ value: "-1.2 hrs vs last month", trend: "down" }} 
        />
        <KPICard 
          label="Avg Resolution Time" 
          value={MOCK_ANALYTICS.avgResolutionTime} 
          icon={<CheckCircle className="w-5 h-5 text-green-600"/>} 
          change={{ value: "+0.5 days vs last month", trend: "up" }} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col h-96">
          <h3 className="font-semibold text-slate-900 mb-4">Incidents by Category</h3>
          <div className="flex-1 min-h-0 w-full relative">
            <CategoryChart />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col h-96">
          <h3 className="font-semibold text-slate-900 mb-4">Report Volume Trends</h3>
          <div className="flex-1 min-h-0 w-full relative">
            <TrendChart />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col h-96">
          <h3 className="font-semibold text-slate-900 mb-4">Incidents by Priority</h3>
          <div className="flex-1 min-h-0 w-full relative">
            <PriorityChart />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col h-96">
          <h3 className="font-semibold text-slate-900 mb-4">Department Workload</h3>
          <div className="flex-1 min-h-0 w-full relative">
            <DepartmentWorkloadChart />
          </div>
        </div>
      </div>
    </div>
  );
};
