import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', reports: 40, incidents: 12 },
  { day: 'Tue', reports: 55, incidents: 15 },
  { day: 'Wed', reports: 35, incidents: 10 },
  { day: 'Thu', reports: 60, incidents: 18 },
  { day: 'Fri', reports: 45, incidents: 14 },
  { day: 'Sat', reports: 80, incidents: 25 },
  { day: 'Sun', reports: 65, incidents: 20 },
];

export const TrendChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] h-full flex flex-col">
      <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Report & Incident Trends</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            />
            <Area type="monotone" dataKey="reports" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" name="Reports" />
            <Area type="monotone" dataKey="incidents" stroke="#06B6D4" strokeWidth={2} fillOpacity={0} fill="none" name="Incidents" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
