import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ className, src, alt, fallback, size = 'md', ...props }: AvatarProps) {
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const imageSrc = src || (fallback ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fallback)}&background=random` : undefined);

  return (
    <div className={cn('relative inline-block rounded-full overflow-hidden shrink-0 border border-border/50 bg-zinc-100', sizes[size], className)}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          {...props}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted font-bold">
          {alt?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}
