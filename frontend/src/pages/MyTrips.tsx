import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  MoreVertical,
  Plane,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreateTripModal } from '../components/trips/CreateTripModal';
import { Badge } from '../components/ui/Badge';

const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips();
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTrips = trips.filter(trip => {
    const today = new Date();
    const startDate = new Date(trip.startDate);
    if (filter === 'upcoming') return startDate >= today;
    if (filter === 'past') return startDate < today;
    return true;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white font-outfit">My Travel Plans</h1>
          <p className="text-white/40 mt-1">Manage your upcoming adventures and past memories.</p>
        </div>
        <Button size="lg" icon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
          New Trip
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
          {['all', 'upcoming', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text"
            placeholder="Search trips..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-white/5 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredTrips.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredTrips.map((trip) => (
            <motion.div key={trip.id} variants={item}>
              <Card 
                hover 
                className="p-0 overflow-hidden border-white/5 group h-full flex flex-col"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <div className="relative h-48">
                  <img 
                    src={trip.coverImage || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600`}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <Badge variant={new Date(trip.startDate) >= new Date() ? 'primary' : 'secondary'}>
                      {new Date(trip.startDate) >= new Date() ? 'Upcoming' : 'Past'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 space-y-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{trip.name}</h3>
                      <button className="p-1 text-white/20 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-white/40 flex items-center gap-1.5 mt-2">
                      <Calendar size={14} className="text-primary" />
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Total Budget</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1">
                        <TrendingUp size={14} className="text-green-400" /> ${trip.totalBudget || 0}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Activities</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1">
                        <Clock size={14} className="text-primary" /> {trip.activityCount || 0} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group/btn pt-2">
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }} // Mock progress
                        className="h-full bg-premium-gradient"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/40 ml-4">45%</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="p-20 border-dashed border-white/10 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-white/20">
            <Plane size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">No trips found</h3>
            <p className="text-white/40 max-w-sm mx-auto">
              Ready to start your next adventure? Create a trip manually or let our AI guide you.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => navigate('/generator')}>Generate with AI</Button>
            <Button onClick={() => setIsModalOpen(true)}>Create Manually</Button>
          </div>
        </Card>
      )}

      <CreateTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadTrips}
      />
    </div>
  );
};

export default MyTrips;
