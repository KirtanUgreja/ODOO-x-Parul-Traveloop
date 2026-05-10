import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-12">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl">
            <Compass size={120} className="text-primary opacity-50" />
          </div>
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-white/5 font-outfit select-none">
          404
        </div>
      </div>

      <div className="space-y-6 max-w-md">
        <h1 className="text-5xl font-bold text-white font-outfit">Lost in Paradise?</h1>
        <p className="text-white/40 text-lg">
          It seems you've wandered off the beaten path. This destination doesn't exist in our itinerary.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            variant="secondary" 
            size="lg" 
            className="flex-1" 
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={20} />}
          >
            Go Back
          </Button>
          <Button 
            size="lg" 
            className="flex-1" 
            onClick={() => navigate('/')}
            icon={<Home size={20} />}
          >
            Take Me Home
          </Button>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full opacity-20" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-accent/20 blur-[120px] rounded-full opacity-20" />
    </div>
  );
};

export default NotFound;
