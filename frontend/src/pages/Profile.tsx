import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Globe, 
  LogOut, 
  Trash2, 
  Camera,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
    currency: 'USD',
    theme: 'dark'
  });

  const handleSave = () => {
    // Save profile logic
    setIsEditing(false);
  };



  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white font-outfit">My Profile</h1>
        <Button 
          variant={isEditing ? 'primary' : 'secondary'} 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          icon={isEditing ? <Check size={18} /> : <User size={18} />}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* User Sidebar */}
        <div className="space-y-6">
          <Card className="p-8 text-center space-y-6 border-white/5 bg-white/5">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-3xl bg-premium-gradient p-[2px]">
                <div className="w-full h-full rounded-3xl bg-dark overflow-hidden relative group">
                  <img 
                    src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" size={24} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-outfit">{user?.name}</h2>
              <p className="text-sm text-white/40">{user?.email}</p>
            </div>
            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-white">12</p>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Trips</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">8</p>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Countries</p>
              </div>
            </div>
          </Card>

          <Button 
            variant="ghost" 
            className="w-full text-red-400 hover:bg-red-400/10 hover:text-red-400 rounded-2xl py-4"
            onClick={logout}
            icon={<LogOut size={20} />}
          >
            Logout Account
          </Button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-8">
          <Card className="p-8 space-y-8 border-white/5 bg-white/5">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-primary" /> Account Information
              </h3>
              <div className="grid gap-6">
                <Input 
                  label="Full Name" 
                  value={formData.name} 
                  disabled={!isEditing} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <Input 
                  label="Email Address" 
                  value={formData.email} 
                  disabled={true} 
                  icon={<Mail size={18} />}
                />
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell size={20} className="text-accent" /> Preferences
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', sub: 'Receive updates about your trips', icon: Bell, active: true },
                  { label: 'Public Profile', sub: 'Allow others to see your travels', icon: Globe, active: false },
                  { label: 'Two-Factor Auth', sub: 'Extra security for your account', icon: Shield, active: false },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-white/5 text-white/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                        <pref.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{pref.label}</p>
                        <p className="text-[11px] text-white/30">{pref.sub}</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${pref.active ? 'bg-primary' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${pref.active ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trash2 size={20} className="text-red-400" /> Danger Zone
              </h3>
              <div className="p-6 rounded-3xl border border-red-400/20 bg-red-400/5 space-y-4">
                <div>
                  <p className="text-sm font-bold text-white">Delete Account</p>
                  <p className="text-xs text-white/40">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <Button variant="ghost" className="text-red-400 hover:bg-red-400/10 px-0">Delete my account permanently</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
