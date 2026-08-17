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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-[#E6E8EC] backdrop-blur-md px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-bold transition-colors ${
                isActive
                  ? 'text-[#2457D6]'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#2457D6]' : 'text-[#667085]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
