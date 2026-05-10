import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Copy, 
  Sparkles,
  Plane,
  Navigation,
  Globe
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

const PublicTrip: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shareToken) loadPublicTrip(shareToken);
  }, [shareToken]);

  const loadPublicTrip = async (token: string) => {
    try {
      setLoading(true);
      const response = await tripService.getPublicTrip(token);
      setTrip(response.data);
    } catch (error) {
      console.error('Failed to load public trip:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-white/40 animate-pulse">Unlocking adventure...</p>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/20">
        <Globe size={48} />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Trip Not Found</h1>
        <p className="text-white/40 max-w-sm">The link might be expired or the trip was made private.</p>
      </div>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );

  const groupedActivities = (trip.activities || []).reduce((acc: any, activity: any) => {
    const dateKey = new Date(activity.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(activity);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-dark pb-20">
      {/* Stunning Header Hero */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <img 
          src={trip.coverImage || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600`} 
          alt={trip.name} 
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Badge variant="primary" className="mx-auto">Public Itinerary</Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white font-outfit tracking-tight">{trip.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 font-medium">
              <span className="flex items-center gap-2"><Calendar size={20} className="text-primary" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><MapPin size={20} className="text-primary" /> {trip.activities?.length || 0} Activities</span>
            </div>
          </motion.div>
        </div>

        {/* Created By Badge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
          <div className="w-8 h-8 rounded-full bg-premium-gradient flex items-center justify-center text-white font-bold text-xs">
            {trip.user?.name?.[0].toUpperCase()}
          </div>
          <span className="text-sm text-white/80">Created by <b className="text-white">{trip.user?.name}</b></span>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-16">
        {/* Call to Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[32px] bg-primary/10 border border-primary/20 backdrop-blur-xl gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="text-primary" size={20} /> Like this trip?
            </h3>
            <p className="text-white/50">Duplicate this itinerary to your account and start customizing it.</p>
          </div>
          {isAuthenticated ? (
            <Button size="lg" icon={<Copy size={20} />}>Copy to My Trips</Button>
          ) : (
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/signup')}>Sign Up Free</Button>
            </div>
          )}
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold text-white font-outfit">Detailed Itinerary</h2>
          <div className="space-y-16 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
            {Object.entries(groupedActivities).map(([date, activities]: [string, any], idx) => (
              <div key={date} className="relative pl-20">
                <div className="absolute left-[26px] top-0 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] ring-4 ring-dark z-10" />
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h3 className="text-2xl font-bold text-white font-outfit">Day {idx + 1}</h3>
                    <Badge variant="secondary">{date}</Badge>
                  </div>
                  
                  <div className="grid gap-6">
                    {activities.map((activity: any, aIdx: number) => (
                      <Card key={aIdx} className="border-white/5 bg-white/[0.02] p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="md:w-32 flex-shrink-0 flex md:flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 text-white/60">
                            <Clock size={20} className="text-primary" />
                            <span className="font-bold text-lg">{activity.time || '09:00'}</span>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-2xl font-bold text-white">{activity.title}</h4>
                              <Badge variant="primary">${activity.cost}</Badge>
                            </div>
                            <p className="text-white/40 leading-relaxed text-lg">{activity.description}</p>
                            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold uppercase tracking-widest text-white/30">
                              <span className="flex items-center gap-2"><Navigation size={16} className="text-primary" /> {activity.location}</span>
                              <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {activity.duration || 60} Mins</span>
                              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">{activity.category}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Branding */}
        <div className="pt-20 text-center space-y-6">
          <div className="flex items-center justify-center gap-3 opacity-30">
            <div className="p-1.5 rounded-lg bg-premium-gradient">
              <Plane className="text-white" size={16} />
            </div>
            <span className="text-xl font-bold text-white font-outfit tracking-tight">Traveloop</span>
          </div>
          <p className="text-white/20 text-xs uppercase tracking-[0.2em]">Travel Smarter, Plan Better</p>
          <div className="flex justify-center gap-4 pt-4">
            <button className="p-3 rounded-full bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"><Share2 size={20} /></button>
            <button className="p-3 rounded-full bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"><Copy size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTrip;
