import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  animate = true,
  hover = true,
  onClick
}) => {
  const content = (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300',
        onClick && 'cursor-pointer',
        hover && 'hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10',
        className
      )}
    >
      {/* Subtle shine effect */}
      <div className="absolute -inset-px bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative p-6">
        {children}
      </div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
    >
      {content}
    </motion.div>
  );
};
