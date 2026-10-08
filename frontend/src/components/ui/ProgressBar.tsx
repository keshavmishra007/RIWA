import React from 'react';
import { cn } from '../../utils/helpers';

export interface ProgressBarProps {
  progress: number;
  label?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  status = 'info', 
  showLabel = true,
  className 
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  const colors = {
    success: 'bg-[#16A34A]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#DC2626]',
    info: 'bg-[#2563EB]'
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showLabel && <span className="text-sm font-medium text-gray-700">{normalizedProgress}%</span>}
        </div>
      )}
      <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 overflow-hidden">
        <div 
          className={cn('h-2.5 rounded-full transition-all duration-500 ease-in-out', colors[status])}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};
