import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { GlobalSearch } from '../search/GlobalSearch';

interface HeaderProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/trips': 'My Travel Plans',
  '/generator': 'AI Itinerary Builder',
  '/budget': 'Budget & Analytics',
  '/profile': 'My Account Settings',
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  const currentPath = location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] || (currentPath.startsWith('/trips/') ? 'Trip Details' : 'Traveloop');

  return (
    <header className="h-20 border-b border-white/5 bg-[#0f172a]/20 backdrop-blur-md px-6 lg:px-10 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu & Page Title */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 md:p-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden transition-all"
          >
            <Menu size={20} className="md:size-22" />
          </button>
          <div className="md:block">
            <h2 className="text-sm md:text-xl font-bold text-white font-outfit tracking-tight truncate max-w-[120px] md:max-w-none">{pageTitle}</h2>
          </div>
        </div>

        {/* Center: Search Bar */}
        <GlobalSearch />

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center gap-3 lg:gap-6">
          <NotificationCenter />

          {/* User Profile Mini */}
          <button className="flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-premium-gradient flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/10">
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{user?.name.split(' ')[0]}</p>
              <p className="text-[10px] text-white/40 font-medium">Pro Plan</p>
            </div>
            <ChevronDown size={14} className="text-white/30 group-hover:text-white transition-colors ml-1" />
          </button>
        </div>
      </div>
    </header>
  );
};
