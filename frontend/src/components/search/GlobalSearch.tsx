import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  MapPin, 
  Calendar, 
  Sparkles,
  ArrowRight,
  History,
  X
} from 'lucide-react';
import { useTrips } from '../../hooks';

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { trips } = useTrips();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredTrips = query 
    ? trips.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <>
      {/* Desktop Search Bar */}
      <div 
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex flex-1 max-w-md relative group cursor-pointer"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-primary transition-colors" size={18} />
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white/30 flex items-center justify-between">
          <span>Search your travels...</span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold">
            <Command size={10} /> K
          </div>
        </div>
      </div>

      {/* Mobile Search Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all"
      >
        <Search size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-[#1e293b]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex items-center gap-4 border-b border-white/5">
                <Search className="text-primary" size={22} />
                <input 
                  autoFocus
                  ref={inputRef}
                  type="text" 
                  placeholder="Search trips, activities, or destinations..."
                  className="flex-1 bg-transparent border-none text-white text-lg outline-none placeholder:text-white/20"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <button onClick={() => setIsOpen(false)} className="p-2 text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto p-4 space-y-6">
                {query ? (
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase font-bold text-white/20 tracking-widest pl-2">Matching Trips</h3>
                    {filteredTrips.length > 0 ? (
                      <div className="grid gap-2">
                        {filteredTrips.map(trip => (
                          <div 
                            key={trip.id}
                            onClick={() => { navigate(`/trips/${trip.id}`); setIsOpen(false); }}
                            className="p-4 rounded-2xl hover:bg-white/5 flex items-center justify-between group cursor-pointer transition-all border border-transparent hover:border-white/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <MapPin size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-white">{trip.name}</p>
                                <p className="text-xs text-white/30">{new Date(trip.startDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <ArrowRight size={18} className="text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-white/20 text-sm italic">
                        No trips found for "{query}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8 py-4">
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase font-bold text-white/20 tracking-widest pl-2">Recent Searches</h3>
                      <div className="flex flex-wrap gap-2 px-2">
                        {['Summer in Italy', 'Tokyo Guide', 'Weekend in Paris'].map(s => (
                          <button key={s} className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                            <History size={14} /> {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase font-bold text-white/20 tracking-widest pl-2">Quick Actions</h3>
                      <div className="grid md:grid-cols-2 gap-3 px-2">
                        <button 
                          onClick={() => { navigate('/generator'); setIsOpen(false); }}
                          className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4 hover:bg-primary/20 transition-all"
                        >
                          <Sparkles className="text-primary" size={20} />
                          <span className="font-bold text-white text-sm">AI Trip Generator</span>
                        </button>
                        <button 
                          onClick={() => { navigate('/trips'); setIsOpen(false); }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all"
                        >
                          <Calendar className="text-accent" size={20} />
                          <span className="font-bold text-white text-sm">Create New Trip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><ArrowRight size={10} className="rotate-90" /> Select</span>
                  <span className="flex items-center gap-1">Enter Open</span>
                </div>
                <span>Search by Traveloop</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
