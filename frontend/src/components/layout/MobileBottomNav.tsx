import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Sparkles, 
  User, 
  TrendingUp 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Trips', path: '/trips' },
  { icon: Sparkles, label: 'AI Plan', path: '/generator' },
  { icon: TrendingUp, label: 'Stats', path: '/budget' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const MobileBottomNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#0f172a]/80 backdrop-blur-2xl border-t border-white/5 px-4 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-between h-20 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-1.5 flex-1 transition-all duration-300',
              isActive ? 'text-primary' : 'text-white/40'
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-1.5 rounded-xl transition-all duration-300',
                  isActive ? 'bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-transparent'
                )}>
                  <item.icon size={22} className={cn(
                    'transition-transform duration-300',
                    isActive ? 'scale-110' : 'scale-100'
                  )} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
