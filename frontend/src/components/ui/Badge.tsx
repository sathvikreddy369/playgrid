import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'cricket' | 'football' | 'basketball' | 'badminton' | 'tennis' | 'pickleball';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    cricket: 'bg-orange-50 text-orange-700 border-orange-200',
    football: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    basketball: 'bg-amber-50 text-amber-700 border-amber-200',
    badminton: 'bg-purple-50 text-purple-700 border-purple-200',
    tennis: 'bg-blue-50 text-blue-700 border-blue-200',
    pickleball: 'bg-lime-50 text-lime-700 border-lime-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
