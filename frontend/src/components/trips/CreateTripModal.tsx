import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ImageIcon, Globe, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { tripService } from '../../services/tripService';
import toast from 'react-hot-toast';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: '',
    isPublic: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tripService.createTrip(formData);
      toast.success('Trip created! Time to start planning 🌍');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
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
            className="relative w-full max-w-2xl"
          >
            <Card className="p-8 lg:p-10 border-white/10 bg-dark-lighter/60 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white font-outfit">Start New Adventure</h2>
                <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Trip Name"
                  placeholder="e.g. Summer in Tuscany"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input 
                    label="Start Date"
                    type="date"
                    icon={<Calendar size={18} />}
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                  <Input 
                    label="End Date"
                    type="date"
                    icon={<Calendar size={18} />}
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <Input 
                  label="Cover Image URL"
                  placeholder="https://images.unsplash.com/..."
                  icon={<ImageIcon size={18} />}
                  value={formData.coverImage}
                  onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                />

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/20 text-primary">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Public Trip</p>
                      <p className="text-xs text-white/40">Allow others to view and duplicate this trip</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.isPublic ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: formData.isPublic ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                    />
                  </button>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                  <Button type="submit" className="flex-1" isLoading={loading} icon={<Save size={18} />}>Create Trip</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
