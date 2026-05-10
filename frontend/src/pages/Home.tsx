import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Map, Calendar, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const Home: React.FC = () => {
  return (
    <div className="min-height-screen p-8 max-w-7xl mx-auto">
      <header className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-4"
        >
          <span className="px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium flex items-center gap-2">
            <Sparkles size={14} /> AI-Powered Travel Planning
          </span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-brand-200 to-accent-300 bg-clip-text text-transparent"
        >
          Traveloop
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto"
        >
          Design your dream journey with the world's most sophisticated AI travel planner. 
          Seamless itineraries, premium aesthetics.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <GlassCard delay={0.4}>
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4 text-brand-400">
            <Plane size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Smart Itineraries</h3>
          <p className="text-slate-400">AI-generated plans tailored to your interests, budget, and pace.</p>
        </GlassCard>

        <GlassCard delay={0.5}>
          <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4 text-accent-400">
            <Map size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Explore Hidden Gems</h3>
          <p className="text-slate-400">Discover places only locals know about with our deep-data exploration.</p>
        </GlassCard>

        <GlassCard delay={0.6}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
            <Calendar size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Seamless Scheduling</h3>
          <p className="text-slate-400">Organize your days perfectly with optimized routes and timing.</p>
        </GlassCard>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <button className="premium-button text-lg px-10 py-4">
          Start Planning Your Escape
        </button>
      </motion.div>
    </div>
  );
};

export default Home;
