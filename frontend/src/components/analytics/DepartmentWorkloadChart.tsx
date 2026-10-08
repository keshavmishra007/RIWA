import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const data = [
  { name: 'Water & Drain', active: 32, resolved: 45 },
  { name: 'Public Works', active: 24, resolved: 38 },
  { name: 'Sanitation', active: 18, resolved: 52 },
  { name: 'Electrical', active: 12, resolved: 20 },
];

export const DepartmentWorkloadChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] h-full flex flex-col">
      <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Department Workload</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} width={90} />
            <Tooltip 
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748B' }} />
            <Bar dataKey="active" name="Active" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="resolved" name="Resolved" fill="#16A34A" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
