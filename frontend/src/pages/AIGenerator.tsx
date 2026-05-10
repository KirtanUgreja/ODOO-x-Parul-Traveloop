import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Loader2, 
  Save, 
  RefreshCw, 
  Download, 
  Share2,
  Clock,
  Navigation
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { tripService } from '../services/tripService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const INTERESTS = [
  'Culture & History', 'Food & Dining', 'Adventure', 
  'Relaxation', 'Shopping', 'Nightlife', 'Nature'
];

const AIGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    destination: '',
    numberOfDays: 5,
    budget: 2000,
    interests: [] as string[]
  });

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.generateItinerary(formData);
      setResult(response.data);
      setStep(2);
    } catch (err: any) {
      const msg = err.message || 'Failed to generate itinerary. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!result) return;
    try {
      const response = await tripService.createTrip({
        name: result.tripName,
        description: result.overview,
        startDate: new Date(),
        endDate: new Date(Date.now() + formData.numberOfDays * 24 * 60 * 60 * 1000),
        isPublic: false
      });
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#8b5cf6', '#a78bfa'],
      });
      toast.success('Trip saved! Redirecting...');
      setTimeout(() => navigate(`/trips/${response.data.id}`), 800);
    } catch (error) {
      toast.error('Failed to save trip. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4"
        >
          <Sparkles size={12} className="md:size-14" /> AI Powered Planning
        </motion.div>
        <h1 className="text-3xl md:text-6xl font-bold text-white font-outfit leading-tight">
          Generate Your Perfect <br />
          <span className="text-transparent bg-clip-text bg-premium-gradient">Itinerary with AI</span>
        </h1>
        <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-lg">
          Just tell us your destination and preferences, and our AI will craft a custom 
          day-by-day plan optimized for your budget and interests.
        </p>
      </section>

      {/* Step Indicator for Mobile */}
      <div className="flex justify-center gap-4 md:hidden px-4">
        {[1, 2].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              step >= s ? 'bg-primary w-12' : 'bg-white/10 w-6'
            }`} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && !loading && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-2"
          >
            <Card className="p-8 lg:p-12 border-white/10 bg-dark-lighter/40 backdrop-blur-xl">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <Input 
                    label="Where are you going?"
                    placeholder="e.g. Paris, France"
                    icon={<MapPin size={18} />}
                    value={formData.destination}
                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70 block">
                      Number of Days: <span className="text-primary">{formData.numberOfDays}</span>
                    </label>
                    <input 
                      type="range" min="1" max="14" step="1"
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      value={formData.numberOfDays}
                      onChange={e => setFormData({ ...formData, numberOfDays: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-tighter">
                      <span>1 Day</span>
                      <span>14 Days</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70 block">
                      Budget ($): <span className="text-primary">{formData.budget}</span>
                    </label>
                    <input 
                      type="range" min="500" max="10000" step="100"
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-tighter">
                      <span>$500</span>
                      <span>$10,000+</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-white/70 block">What are your interests?</label>
                  <div className="flex flex-wrap gap-3">
                    {INTERESTS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                            : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}
              <Button 
                size="lg" 
                className="w-full h-16 rounded-[24px] text-lg font-bold"
                onClick={handleGenerate}
                disabled={!formData.destination}
                icon={<Sparkles size={22} />}
              >
                Generate My Adventure
              </Button>
            </Card>
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-8"
          >
            <div className="relative inline-block">
              <Loader2 size={80} className="text-primary animate-spin" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Creating your perfect trip...</h2>
              <p className="text-white/40">Our AI is analyzing thousands of destinations and activities.</p>
            </div>
          </motion.div>
        )}

        {step === 2 && result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 md:space-y-10 px-2 md:px-0"
          >
            {/* Result Header */}
            <Card className="p-6 md:p-8 lg:p-12 border-primary/20 bg-primary/5 backdrop-blur-2xl relative overflow-hidden rounded-[32px]">
              <div className="relative z-10 space-y-4 md:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-white font-outfit">{result.tripName}</h2>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1 md:flex-none" icon={<RefreshCw size={14} />} onClick={() => setStep(1)}>Retry</Button>
                    <Button size="sm" className="flex-1 md:flex-none" icon={<Save size={14} />} onClick={handleSaveTrip}>Save</Button>
                  </div>
                </div>
                <p className="text-sm md:text-lg text-white/60 leading-relaxed max-w-3xl">
                  {result.overview}
                </p>
                <div className="flex flex-wrap gap-4 md:gap-6 pt-2">
                  <div className="flex items-center gap-2 text-white/50 text-xs md:text-base">
                    <DollarSign size={16} className="text-primary md:size-18" />
                    <span>Budget: <b className="text-white">${result.estimatedBudget}</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs md:text-base">
                    <Calendar size={16} className="text-primary md:size-18" />
                    <span>Duration: <b className="text-white">{result.days?.length} Days</b></span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Day by Day Timeline */}
            <div className="space-y-8 md:space-y-12 relative before:absolute before:left-4 md:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
              {result.days?.map((day: any, dIdx: number) => (
                <div key={dIdx} className="relative pl-10 md:pl-20">
                  <div className="absolute left-[13px] md:left-[26px] top-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] ring-4 ring-dark z-10" />
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl md:text-2xl font-bold text-white font-outfit">Day {day.day}</h3>
                      <Badge variant="secondary" className="text-[10px] md:text-xs">{day.date || 'Adventure'}</Badge>
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      {day.activities?.map((activity: any, aIdx: number) => (
                        <Card key={aIdx} className="border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group p-4 md:p-6">
                          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            <div className="flex md:flex-col items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 text-white/60 md:w-32 flex-shrink-0">
                              <Clock size={16} className="text-primary md:size-20" />
                              <span className="font-bold text-base md:text-lg">{activity.time}</span>
                            </div>
                            <div className="flex-1 space-y-2 md:space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight">{activity.title}</h4>
                                <Badge variant="primary" className="text-[10px] flex-shrink-0">${activity.estimatedCost}</Badge>
                              </div>
                              <p className="text-xs md:text-sm text-white/40 leading-relaxed">{activity.description}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[9px] md:text-xs font-medium uppercase tracking-wider text-white/30">
                                <span className="flex items-center gap-1"><Navigation size={12} className="text-primary" /> {activity.location}</span>
                                <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {activity.duration}m</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">{activity.category}</span>
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

            {/* Bottom Actions */}
            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6 pt-8 md:pt-12 pb-20">
              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="secondary" size="lg" className="flex-1 md:flex-none" icon={<Share2 size={18} />}>Share</Button>
                <Button variant="secondary" size="lg" className="flex-1 md:flex-none" icon={<Download size={18} />}>PDF</Button>
              </div>
              <Button size="lg" className="w-full md:w-auto" icon={<Save size={20} />} onClick={handleSaveTrip}>Save to My Trips</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIGenerator;
