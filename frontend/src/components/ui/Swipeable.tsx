import React from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SwipeableProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

export const Swipeable: React.FC<SwipeableProps> = ({ children, onDelete, className }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0], [0.5, 1, 1]);
  const scale = useTransform(x, [-100, -50, 0], [1.1, 1, 1]);
  const backgroundColor = useTransform(x, [-100, -50, 0], ['#ef4444', '#fecaca', 'transparent']);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) {
      onDelete();
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-[32px] ${className}`}>
      {/* Background Action */}
      <motion.div 
        style={{ opacity, backgroundColor }}
        className="absolute inset-0 flex items-center justify-end pr-8"
      >
        <motion.div style={{ scale }}>
          <Trash2 className="text-white" size={24} />
        </motion.div>
      </motion.div>

      {/* Foreground Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};
