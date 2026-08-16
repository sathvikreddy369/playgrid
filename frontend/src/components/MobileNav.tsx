import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, User } from 'lucide-react';


export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Create', path: '/create-match', icon: PlusCircle },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-lg px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
