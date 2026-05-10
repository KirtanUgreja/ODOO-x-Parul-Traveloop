import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Share2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, trip }) => {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(trip?.isPublic || false);
  
  const shareUrl = `${window.location.origin}/share/${trip?.shareToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="p-8 border-white/10 bg-dark-lighter/60 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white font-outfit">Share Your Trip</h2>
                <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isPublic ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}`}>
                      {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{isPublic ? 'Public Trip' : 'Private Trip'}</p>
                      <p className="text-xs text-white/40">{isPublic ? 'Anyone with the link can view' : 'Only you can see this trip'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: isPublic ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white" 
                    />
                  </button>
                </div>

                {isPublic ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Shareable Link</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 truncate">
                          {shareUrl}
                        </div>
                        <Button 
                          variant="secondary" 
                          onClick={copyToClipboard}
                          icon={copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <Button variant="secondary" className="w-full" icon={<Share2 size={18} />}>Share Itinerary</Button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center bg-primary/5 border border-primary/10 rounded-[32px] space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary">
                      <Globe size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Enable public sharing</p>
                      <p className="text-xs text-white/40">You need to make your trip public to generate a shareable link.</p>
                    </div>
                    <Button onClick={() => setIsPublic(true)} size="sm">Make Public</Button>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                <Button variant="secondary" onClick={onClose}>Done</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
