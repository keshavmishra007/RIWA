import React from 'react';
import { cn } from '../../utils/helpers';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'success' | 'default';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'default', 
  size = 'sm', 
  showDot = false, 
  children, 
  ...props 
}) => {
  const variants = {
    critical: 'bg-red-50 text-red-800',
    high: 'bg-orange-50 text-orange-800',
    medium: 'bg-amber-50 text-amber-800',
    low: 'bg-blue-50 text-blue-800',
    success: 'bg-green-50 text-green-800',
    default: 'bg-gray-100 text-gray-700'
  };

  const dotColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
    success: 'bg-green-500',
    default: 'bg-gray-500'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
};
