import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-white/70 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-primary">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 backdrop-blur-md outline-none transition-all duration-200',
            'focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10',
            icon ? 'pl-11' : 'pl-4',
            error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1 ml-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
