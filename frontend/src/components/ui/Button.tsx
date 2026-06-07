import React from 'react';
import { cn } from '../../lib/utils.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          // Variants
          {
            "bg-brand text-white hover:bg-brand-600 shadow-md shadow-brand/10": variant === 'primary',
            "bg-dark-surface border border-dark-border text-gray-200 hover:bg-[#181822]": variant === 'secondary',
            "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20": variant === 'danger',
            "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20": variant === 'success',
            "text-gray-400 hover:text-gray-200 hover:bg-dark-surface/50": variant === 'ghost',
          },
          // Sizes
          {
            "h-8 px-3 text-xs rounded-btn": size === 'sm',
            "h-10 px-4 text-sm rounded-btn": size === 'md',
            "h-12 px-6 text-base rounded-btn": size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
