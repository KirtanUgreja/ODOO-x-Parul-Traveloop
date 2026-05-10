import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  RotateCcw, 
  Printer, 
  Sparkles,
  CheckCircle2,
  Circle,
  GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Swipeable } from '../components/ui/Swipeable';
const CATEGORIES = [
  'Clothing', 'Documents', 'Electronics', 'Toiletries', 'Medications', 'Miscellaneous'
];

const TEMPLATES = {
  beach: [
    { title: 'Swimwear', category: 'Clothing' },
    { title: 'Sunscreen', category: 'Toiletries' },
    { title: 'Beach Towel', category: 'Miscellaneous' },
    { title: 'Sunglasses', category: 'Miscellaneous' }
  ],
  business: [
    { title: 'Formal Suit', category: 'Clothing' },
    { title: 'Laptop & Charger', category: 'Electronics' },
    { title: 'Business Cards', category: 'Documents' }
  ]
};

const PackingChecklist: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ title: '', category: 'Miscellaneous' });
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const saved = localStorage.getItem('packing_list');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('packing_list', JSON.stringify(items));
  }, [items]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;
    setItems([...items, { id: Date.now().toString(), ...newItem, packed: false }]);
    setNewItem({ title: '', category: 'Miscellaneous' });
  };

  const togglePacked = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const applyTemplate = (type: keyof typeof TEMPLATES) => {
    const templateItems = TEMPLATES[type].map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      ...item,
      packed: false
    }));
    setItems([...items, ...templateItems]);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  const packedCount = items.filter(i => i.packed).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit">Packing Checklist</h1>
          <p className="text-sm text-white/40 mt-1">Get organized for your next adventure.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1 md:flex-none" icon={<RotateCcw size={16} />} onClick={() => setItems([])}>Reset</Button>
          <Button size="sm" className="flex-1 md:flex-none" icon={<Printer size={16} />}>Print</Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-6 md:p-8 border-primary/20 bg-primary/5 backdrop-blur-2xl mx-2 md:mx-0">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-white">Packing Progress</h3>
            <p className="text-xs md:text-sm text-white/40">{packedCount} of {items.length} packed</p>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-primary font-outfit">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 md:h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-premium-gradient shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          />
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Templates & Add */}
        <div className="space-y-8">
          <Card className="p-6 space-y-6 border-white/5 bg-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Quick Add</h3>
            <form onSubmit={addItem} className="space-y-4">
              <input 
                type="text" 
                placeholder="Add item..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition-all"
                value={newItem.title}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
              />
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 outline-none focus:border-primary transition-all appearance-none"
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Button type="submit" className="w-full" icon={<Plus size={18} />}>Add Item</Button>
            </form>
          </Card>

          <Card className="p-6 space-y-4 border-white/5 bg-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Templates</h3>
            <div className="grid gap-2">
              <button 
                onClick={() => applyTemplate('beach')}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 hover:text-white transition-all flex items-center justify-between"
              >
                🏖️ Beach Trip Template <Plus size={14} />
              </button>
              <button 
                onClick={() => applyTemplate('business')}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 hover:text-white transition-all flex items-center justify-between"
              >
                💼 Business Trip Template <Plus size={14} />
              </button>
            </div>
          </Card>

          <Card className="p-6 bg-premium-gradient border-none">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} /> AI Suggestions
            </h3>
            <p className="text-[11px] text-white/70 mt-2 leading-relaxed">
              Based on your upcoming trip to **Iceland**, we suggest adding:
              <br />• Thermal base layer
              <br />• Waterproof boots
              <br />• Camera tripod
            </p>
            <Button variant="ghost" size="sm" className="w-full mt-4 bg-white/10 border-white/20 hover:bg-white/20 text-[10px] uppercase font-bold">Add All Suggestions</Button>
          </Card>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scroll-hide">
            {['All', ...CATEGORIES].map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === c 
                    ? 'bg-primary text-white' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  <AnimatePresence>
                    {items
                      .filter(item => filter === 'All' || item.category === filter)
                      .map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="px-2"
                            >
                              <Swipeable onDelete={() => deleteItem(item.id)}>
                                <Card className={`p-4 border-white/5 transition-all group ${item.packed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white/5'}`}>
                                  <div className="flex items-center gap-4">
                                    <div {...provided.dragHandleProps} className="text-white/10 hover:text-white/30 cursor-grab">
                                      <GripVertical size={18} />
                                    </div>
                                    <button onClick={() => togglePacked(item.id)}>
                                      {item.packed 
                                        ? <CheckCircle2 className="text-primary" size={22} /> 
                                        : <Circle className="text-white/20 hover:text-white/40" size={22} />
                                      }
                                    </button>
                                    <div className="flex-1">
                                      <p className={`text-sm font-bold ${item.packed ? 'text-white/20 line-through' : 'text-white'}`}>
                                        {item.title}
                                      </p>
                                      <span className="text-[10px] text-white/30 uppercase font-bold">{item.category}</span>
                                    </div>
                                  </div>
                                </Card>
                              </Swipeable>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {items.length === 0 && (
            <div className="py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-[32px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                <CheckSquare size={32} />
              </div>
              <p className="text-white/40 font-medium">Your packing list is empty. Start adding items!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackingChecklist;
