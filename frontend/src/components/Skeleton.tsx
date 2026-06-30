import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-border rounded-md ${className}`} />
  );
};

export const PostSkeleton = () => {
  return (
    <div className="card p-5 mb-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-11 h-11 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 py-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24 mb-4" />
          
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-[90%] mb-2" />
          <Skeleton className="h-4 w-[40%] mb-5" />
          
          <div className="flex items-center gap-6">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
