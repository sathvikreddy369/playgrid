import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, startIcon, endIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-extrabold uppercase tracking-wider text-muted select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              'w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 placeholder:text-muted/65 disabled:opacity-50 disabled:bg-zinc-50',
              startIcon && 'pl-11',
              endIcon && 'pr-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3.5 text-muted flex items-center justify-center">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
