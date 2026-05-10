import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Map, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-blob-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '5s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 h-20 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-premium-gradient">
            <Plane className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold text-white font-outfit">Traveloop</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-white/70 hover:text-white transition-colors font-medium">Login</Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="accent" className="mb-6">The Future of Travel Planning</Badge>
            <h1 className="text-6xl lg:text-8xl font-bold text-white font-outfit leading-tight">
              Design Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-premium-gradient">Escape</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Say goodbye to messy spreadsheets. Use AI to craft detailed itineraries, 
            track your budget in real-time, and share your adventures with the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/signup">
              <Button size="lg" className="rounded-2xl px-10">Start Planning Free</Button>
            </Link>
            <Link to="/explore">
              <Button variant="secondary" size="lg" className="rounded-2xl px-10">Explore Destinations</Button>
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: Sparkles, title: 'AI Intelligence', desc: 'Generate complete 5-day itineraries in seconds based on your budget and interests.' },
            { icon: Map, title: 'Smart Budgeting', desc: 'Every activity automatically updates your trip budget. Stay on track without the math.' },
            { icon: ShieldCheck, title: 'Ownership & Sync', desc: 'Secure cloud syncing across all your devices. Your data, your trips, always accessible.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
              className="p-8 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 hover:shadow-premium transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Helper component for LandingPage
const Badge: React.FC<{ children: React.ReactNode; variant?: any; className?: string }> = ({ children, className }) => (
  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white/70 ${className}`}>
    {children}
  </span>
);

export default LandingPage;
