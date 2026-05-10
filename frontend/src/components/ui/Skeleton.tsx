import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangular' 
}) => {
  return (
    <div 
      className={cn(
        "animate-pulse bg-white/5",
        variant === 'circular' ? 'rounded-full' : 'rounded-2xl',
        className
      )}
    />
  );
};

export const CardSkeleton = () => (
  <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
    <Skeleton className="h-40 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-8 w-1/4" />
    </div>
  </div>
);
