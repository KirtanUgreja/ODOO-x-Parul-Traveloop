import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex space-x-1 rounded-2xl bg-white/5 p-1 backdrop-blur-md', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex flex-1 items-center justify-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200',
              isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/20"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
