import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const data = [
  { name: 'Critical', value: 12, color: '#B91C1C' },
  { name: 'High', value: 28, color: '#DC2626' },
  { name: 'Medium', value: 45, color: '#F59E0B' },
  { name: 'Low', value: 15, color: '#16A34A' },
];

export const PriorityChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] h-full flex flex-col">
      <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Priority Distribution</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Incidents">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
