import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button.js';
import { cn } from '../../lib/utils.js';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center border border-dashed border-dark-border rounded-card bg-dark-surface/10", className)}>
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-dark-surface border border-dark-border text-gray-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
