import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  Info, 
  Calendar, 
  Sparkles,
  ChevronRight,
  Inbox,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';

// Mock notifications for demonstration
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Trip Generated!', message: 'Your itinerary for Paris is ready to view.', type: 'ai', time: '2 mins ago', read: false },
  { id: '2', title: 'Budget Alert', message: 'You have reached 80% of your Tokyo budget.', type: 'budget', time: '1 hour ago', read: false },
  { id: '3', title: 'Upcoming Adventure', message: 'Your trip to Bali starts in 3 days!', type: 'trip', time: '5 hours ago', read: true },
];

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'ai': return <Sparkles className="text-primary" size={18} />;
      case 'budget': return <TrendingUp className="text-red-400" size={18} />;
      case 'trip': return <Calendar className="text-accent" size={18} />;
      default: return <Info className="text-blue-400" size={18} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all group"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-[10px] font-bold text-white flex items-center justify-center rounded-full shadow-lg shadow-primary/40 ring-2 ring-[#0f172a]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed md:absolute right-4 md:right-0 left-4 md:left-auto top-24 md:top-auto mt-4 w-auto md:w-96 z-[110] origin-top-right"
            >
              <Card className="p-0 overflow-hidden border-white/10 bg-[#1e293b]/95 backdrop-blur-2xl shadow-2xl">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="font-bold text-white">Notifications</h3>
                  <button className="text-[10px] uppercase font-bold text-primary hover:text-white transition-colors">Mark all as read</button>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`p-4 flex gap-4 hover:bg-white/5 transition-all cursor-pointer relative ${!n.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                              {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-white/20 flex items-center gap-1">
                              <Clock size={10} /> {n.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                        <Inbox size={24} />
                      </div>
                      <p className="text-sm text-white/30">All caught up!</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                  <Link 
                    to="/notifications" 
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-white/40 hover:text-white flex items-center justify-center gap-1 transition-all"
                  >
                    View All Activity <ChevronRight size={14} />
                  </Link>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
