import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Sparkles, 
  TrendingUp, 
  User, 
  LogOut,
  Plane,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Map, label: 'My Trips', path: '/trips' },
  { icon: Sparkles, label: 'AI Generator', path: '/generator' },
  { icon: TrendingUp, label: 'Budget', path: '/budget' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        'bg-[#0f172a]/80 backdrop-blur-2xl border-r border-white/5',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full p-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-premium-gradient shadow-lg shadow-primary/20">
                <Plane className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-outfit">
                Traveloop
              </h1>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) => cn(
                    'relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden',
                    isActive 
                      ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' 
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon size={22} className={cn(
                    'transition-all duration-300 group-hover:scale-110 z-10',
                    isActive ? 'text-primary' : 'text-white/40 group-hover:text-white'
                  )} />
                  <span className="font-medium z-10">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute left-0 w-1.5 h-8 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Section (Bottom) */}
          <div className="pt-6 mt-6 border-t border-white/5">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-premium-gradient p-[1px]">
                  <div className="w-full h-full rounded-xl bg-dark-lighter overflow-hidden">
                    <img 
                      src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0f172a]" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Traveler'}</p>
                <p className="text-[11px] text-white/40 truncate tracking-tight">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 group"
            >
              <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
