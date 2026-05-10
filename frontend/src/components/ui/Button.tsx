import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onScroll'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-premium-gradient text-white shadow-lg hover:shadow-primary/25',
    secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/10',
    danger: 'bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || disabled}
      {...(props as any)}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};
