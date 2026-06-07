import React from 'react';
import { cn } from '../../lib/utils.js';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect', ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-dark-surface border border-dark-border/40",
        {
          "h-4 w-full rounded-md": variant === 'text',
          "h-24 w-full rounded-card": variant === 'rect',
          "h-10 w-10 rounded-full": variant === 'circle'
        },
        className
      )}
      {...props}
    />
  );
};
export default Skeleton;
