import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Drainage', value: 45, color: '#2563EB' },
  { name: 'Garbage', value: 30, color: '#16A34A' },
  { name: 'Road', value: 15, color: '#F59E0B' },
  { name: 'Electrical', value: 10, color: '#EAB308' },
];

export const CategoryChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] h-full flex flex-col">
      <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Incidents by Category</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ percent }: { percent?: number }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              itemStyle={{ color: '#0F172A', fontWeight: 500 }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
