import React from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'processing';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border",
        {
          "bg-gray-500/10 border-gray-500/20 text-gray-400": variant === 'default',
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400": variant === 'success',
          "bg-amber-500/10 border-amber-500/20 text-amber-400": variant === 'warning',
          "bg-rose-500/10 border-rose-500/20 text-rose-400": variant === 'danger',
          "bg-indigo-500/10 border-indigo-500/20 text-indigo-400": variant === 'info',
          "bg-sky-500/10 border-sky-500/20 text-sky-400 pulse-active": variant === 'processing'
        },
        className
      )}
      {...props}
    >
      {variant === 'processing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
      )}
      {children}
    </span>
  );
};
export default Badge;
