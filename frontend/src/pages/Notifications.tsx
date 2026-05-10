import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Check, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Info,
  Search,
  Inbox
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Trip Generated!', message: 'Your itinerary for Paris is ready to view. Our AI suggested 12 hidden gems based on your interest in "Culture".', type: 'ai', time: '2 mins ago', read: false },
  { id: '2', title: 'Budget Alert', message: 'You have reached 80% of your Tokyo budget. Your current spending is $1,600 out of $2,000.', type: 'budget', time: '1 hour ago', read: false },
  { id: '3', title: 'Upcoming Adventure', message: 'Your trip to Bali starts in 3 days! Remember to check your flight status and pack essentials.', type: 'trip', time: '5 hours ago', read: true },
  { id: '4', title: 'New Destination Added', message: 'Explore our newly added guide for Santorini, Greece.', type: 'info', time: '1 day ago', read: true },
  { id: '5', title: 'Collaborator Joined', message: 'Sarah joined your "Summer in Italy" trip.', type: 'trip', time: '2 days ago', read: true },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.read);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'ai': return <Sparkles className="text-primary" size={20} />;
      case 'budget': return <TrendingUp className="text-red-400" size={20} />;
      case 'trip': return <Calendar className="text-accent" size={20} />;
      default: return <Info className="text-blue-400" size={20} />;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white font-outfit">Notifications</h1>
          <p className="text-white/40 mt-1">Stay updated with your trips and AI suggestions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>Mark all as read</Button>
          <Button variant="secondary" size="sm" icon={<Trash2 size={16} />} onClick={() => setNotifications([])}>Clear all</Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex p-1 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
          {['all', 'unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === f 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="Search alerts..."
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredNotifications.length > 0 ? (
          <motion.div 
            key={filter}
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredNotifications.map((n) => (
              <motion.div key={n.id} variants={item}>
                <Card 
                  className={`p-6 flex gap-6 items-start border-white/5 group hover:bg-white/10 transition-all ${!n.read ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : 'bg-white/5'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-bold ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.title}</h3>
                        {!n.read && <Badge variant="primary">New</Badge>}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${!n.read ? 'text-white/70' : 'text-white/40'}`}>{n.message}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-[10px] text-white/20 font-bold uppercase flex items-center gap-1.5">
                        <Clock size={12} /> {n.time}
                      </span>
                      <span className="text-[10px] text-white/20 font-bold uppercase flex items-center gap-1.5">
                        <Info size={12} /> {n.type} notification
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-20 text-center space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/10">
              <Inbox size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">No notifications here</h3>
              <p className="text-white/40">We'll let you know when something exciting happens!</p>
            </div>
            <Button variant="secondary" onClick={() => setFilter('all')}>View Read Notifications</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
