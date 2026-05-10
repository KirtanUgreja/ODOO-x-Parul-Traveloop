import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-5',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={cn(
          'animate-spin rounded-full border-primary/20 border-t-primary',
          sizes[size],
          className
        )}
      />
    </div>
  );
};

export const FullScreenLoading = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark/80 backdrop-blur-md">
    <LoadingSpinner size="lg" />
    <p className="mt-4 animate-pulse text-sm font-medium tracking-widest text-white/50 uppercase">
      Loading Experience...
    </p>
  </div>
);
