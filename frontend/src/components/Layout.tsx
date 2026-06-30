import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { NotificationBell } from './NotificationBell';
import { Home, Search, Users, MapPin, Calendar, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/communities', icon: Users, label: 'Groups' },
    { path: '/matches', icon: Calendar, label: 'Matches' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex flex-col">
      {/* Top Header - Glassmorphic */}
      <header className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Playgrid</Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/search" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Search</Link>
            <Link to="/feed" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Feed</Link>
            <Link to="/communities" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Communities</Link>
            <Link to="/grounds" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Venues</Link>
            <Link to="/matches" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Matches</Link>
            {user && <Link to="/messages" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Messages</Link>}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NotificationBell />
                <Link to="/profile" className="hidden md:block">
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                    className="w-9 h-9 rounded-full shadow-sm" 
                    alt="Profile" 
                  />
                </Link>
              </>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all">Sign In</Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* We use location.pathname as key to trigger animations on route change if we wrap Outlet in AnimatePresence. 
            For now, just simple rendering is optimal for performance. */}
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          {user ? (
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.startsWith('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <User className={`w-6 h-6 ${location.pathname.startsWith('/profile') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/login' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <User className="w-6 h-6 stroke-2" />
              <span className="text-[10px] font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};
