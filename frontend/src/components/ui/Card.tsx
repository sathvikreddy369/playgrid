import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
