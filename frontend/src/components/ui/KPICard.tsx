import React from 'react';
import { cn } from '../../utils/helpers';
import { Card } from './Card';

export interface KPICardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, icon, change, className }) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-[#64748B]">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-bold text-[#0F172A]">{value}</h3>
        {change && (
          <span className={cn('text-sm font-medium', trendColors[change.trend])}>
            {change.trend === 'up' && '+'}
            {change.trend === 'down' && '-'}
            {change.value}
          </span>
        )}
      </div>
    </Card>
  );
};
