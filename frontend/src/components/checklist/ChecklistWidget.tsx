import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  ArrowRight,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const ChecklistWidget: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('packing_list');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const packedCount = items.filter(i => i.packed).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  return (
    <Card className="p-6 border-white/5 bg-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckSquare size={18} className="text-primary" /> Packing Progress
        </h3>
        <button 
          onClick={() => navigate('/checklist')}
          className="text-xs font-bold text-white/30 hover:text-white flex items-center gap-1 transition-all"
        >
          View Full <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-white/40">{packedCount} of {items.length} items</span>
          <span className="text-primary font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
        {items.slice(0, 3).map(item => (
          <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-[11px]">
            {item.packed ? <CheckCircle2 size={14} className="text-primary" /> : <Circle size={14} className="text-white/20" />}
            <span className={`flex-1 truncate ${item.packed ? 'text-white/20 line-through' : 'text-white/60'}`}>
              {item.title}
            </span>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-[10px] text-white/20 text-center italic">+{items.length - 3} more items...</p>
        )}
      </div>

      <Button variant="secondary" size="sm" className="w-full h-10 text-[11px]" onClick={() => navigate('/checklist')}>
        Manage Checklist
      </Button>
    </Card>
  );
};
