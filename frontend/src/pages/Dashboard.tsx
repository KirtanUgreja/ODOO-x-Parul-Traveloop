import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Sparkles, 
  List, 
  ChevronRight,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tripService } from '../services/tripService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Recommended Destinations Data
const RECOMMENDED = [
  { name: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400' },
  { name: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=400' },
  { name: 'Bali', country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=400' },
  { name: 'New York', country: 'USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=400' },
  { name: 'Dubai', country: 'UAE', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400' },
  { name: 'Barcelona', country: 'Spain', img: 'https://images.unsplash.com/photo-1583997051654-8f44c2cb0d59?q=80&w=400' },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
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

  const upcomingTrips = trips.filter(trip => new Date(trip.startDate) >= new Date());
  const totalBudget = trips.reduce((acc, trip) => acc + (trip.totalBudget || 0), 0);

  // Animation variants
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

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-white/5 rounded-[40px]" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-12"
    >
      {/* a) HERO WELCOME SECTION */}
      <section className="relative overflow-hidden rounded-[40px] bg-dark-lighter/40 border border-white/5 p-8 lg:p-12">
        <div className="relative z-10 space-y-8">
          <motion.div variants={item}>
            <h1 className="text-4xl lg:text-6xl font-bold font-outfit leading-tight text-white">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-premium-gradient">
                {user?.name.split(' ')[0]}!
              </span>
            </h1>
          </motion.div>
          
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Total Trips</p>
              <p className="text-3xl font-bold text-white">{trips.length}</p>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-white">{upcomingTrips.length}</p>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-white">${totalBudget.toLocaleString()}</p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Button size="lg" className="rounded-2xl px-8" onClick={() => navigate('/generator')} icon={<Sparkles size={20} />}>
              Plan New Trip
            </Button>
          </motion.div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[100px] rounded-full -mr-24 -mt-24 animate-pulse-slow" />
      </section>

      {/* b) UPCOMING TRIPS CAROUSEL */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-white font-outfit">Upcoming Trips</h2>
          <Link to="/trips" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scroll-hide snap-x">
          {upcomingTrips.length > 0 ? (
            upcomingTrips.map((trip) => (
              <motion.div key={trip.id} variants={item} className="snap-start min-w-[300px] md:min-w-[350px]">
                <Card hover className="p-0 overflow-hidden border-white/5 group h-full">
                  <div className="relative h-44">
                    <img 
                      src={trip.coverImage || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400`} 
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/90 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {Math.max(0, Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days Away
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white truncate">{trip.name}</h3>
                      <p className="text-sm text-white/40 flex items-center gap-1.5 mt-1">
                        <Calendar size={14} /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs text-white/30 flex items-center gap-1.5">
                        <List size={14} /> {trip.activityCount || 0} Activities
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="w-full p-12 border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                <MapPin size={32} />
              </div>
              <p className="text-white/50 max-w-xs">No upcoming trips. Let AI help you plan your first one!</p>
              <Button onClick={() => navigate('/generator')} variant="secondary">Get Started</Button>
            </Card>
          )}
        </div>
      </section>

      {/* c) QUICK ACTIONS GRID */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Generate with AI', icon: Sparkles, path: '/generator', color: 'primary' },
          { label: 'Create Trip', icon: Plus, path: '/trips/new', color: 'secondary' },
          { label: 'View All Trips', icon: List, path: '/trips', color: 'accent' },
          { label: 'Budget Analytics', icon: TrendingUp, path: '/budget', color: 'primary' },
        ].map((action, i) => (
          <motion.button
            key={i}
            variants={item}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className="p-6 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-center group"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${action.color}/20 text-${action.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon size={24} />
            </div>
            <span className="text-sm font-semibold text-white/70 group-hover:text-white">{action.label}</span>
          </motion.button>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* d) RECENT ACTIVITY */}
        <Card className="lg:col-span-2 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-primary" /> Recent Activity
            </h2>
          </div>
          
          <div className="space-y-4">
            {trips.length > 0 ? (
              // In a real app, we'd fetch actual recent activities. Here we'll mock or use recent trips.
              trips.slice(0, 5).map((trip, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-premium-gradient flex items-center justify-center text-white">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">New Trip Created: {trip.name}</p>
                      <p className="text-xs text-white/40">{new Date(trip.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">${trip.totalBudget}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Budget</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-white/30">No recent activity to show.</p>
            )}
          </div>
        </Card>

        {/* e) RECOMMENDED DESTINATIONS */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white px-2">Recommended</h2>
          <div className="space-y-4">
            {RECOMMENDED.map((dest, i) => (
              <motion.div 
                key={i} 
                variants={item}
                whileHover={{ x: 5 }}
                className="group relative h-20 rounded-2xl overflow-hidden cursor-pointer border border-white/5"
                onClick={() => navigate('/generator')}
              >
                <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark/90 to-dark/20 flex items-center px-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">{dest.name}</h3>
                    <p className="text-[10px] text-white/50">{dest.country}</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={16} className="text-primary" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Dashboard;
