import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface UserLinkProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function UserLink({ userId, children, className, onClick }: UserLinkProps) {
  return (
    <Link 
      to={`/profile/${userId}`} 
      className={cn('inline-flex items-center gap-2 hover:opacity-80 transition-opacity', className)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
