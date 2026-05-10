import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className,
}) => {
  const variants = {
    primary: 'bg-primary/20 text-primary border-primary/30',
    secondary: 'bg-secondary/20 text-secondary border-secondary/30',
    accent: 'bg-accent/20 text-accent border-accent/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
