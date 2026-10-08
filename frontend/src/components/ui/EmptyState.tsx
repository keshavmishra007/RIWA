import React from 'react';
import { cn } from '../../utils/helpers';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#E2E8F0]', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
};
