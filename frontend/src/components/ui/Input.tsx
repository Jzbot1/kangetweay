import React from 'react';
import { cn } from '../../lib/utils.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-10 px-3 bg-dark-bg border border-dark-border text-gray-200 text-sm rounded-input outline-none transition-all placeholder-gray-600 focus:border-brand/50 focus:ring-1 focus:ring-brand/35 disabled:opacity-50 disabled:pointer-events-none",
            {
              "border-red-500/50 focus:border-red-500 focus:ring-red-500/20": error,
            },
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400 font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
