import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 blur-[130px] rounded-full" />
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hidden lg:block space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Plane className="text-primary" size={20} />
            <span className="text-sm font-medium text-white/80">Premium Travel Experience</span>
          </div>
          
          <h1 className="text-6xl font-bold font-outfit text-white leading-tight">
            Plan your next <br />
            <span className="text-transparent bg-clip-text bg-premium-gradient">Adventure</span> with <br />
            Traveloop
          </h1>
          
          <p className="text-xl text-white/50 max-w-md leading-relaxed">
            Experience the future of travel planning. AI-powered itineraries, 
            smart budgeting, and seamless coordination in one beautiful place.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-dark bg-white/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-white/40">
              <span className="text-white font-semibold">2,000+</span> travelers already <br />
              planned their dream trips.
            </p>
          </div>
        </motion.div>

        {/* Content Section (Login/Register Forms) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
