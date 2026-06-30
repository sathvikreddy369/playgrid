import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { NotificationBell } from './NotificationBell';
import { Home, Search, Users, MapPin, Calendar, MessageSquare, User, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/communities', icon: Users, label: 'Communities' },
    { path: '/matches', icon: Calendar, label: 'Matches' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-200">
      {/* Top Header - Glassmorphic */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            Playgrid
          </Link>
          
          {/* Desktop Nav */}
          <nav aria-label="Primary navigation" className="hidden md:flex gap-1 bg-surface/50 border border-border p-1 rounded-full shadow-sm">
            {[
              { path: '/feed', label: 'Feed' },
              { path: '/communities', label: 'Communities' },
              { path: '/grounds', label: 'Venues' },
              { path: '/matches', label: 'Matches' },
            ].map(item => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    isActive 
                      ? 'text-foreground' 
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-border rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/search" aria-label="Search" className="hidden md:flex w-9 h-9 items-center justify-center rounded-full text-muted hover:bg-border transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            
            {user ? (
              <>
                {/* Ensure NotificationBell inherits clean styling if needed */}
                <NotificationBell />
                <Link to="/messages" aria-label="Messages" className="hidden md:flex w-9 h-9 items-center justify-center rounded-full text-muted hover:bg-border transition-colors relative">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link to="/profile" aria-label="Your Profile" className="hidden md:block ml-2 group">
                  <div className="p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-primary-500 transition-all">
                    <img 
                      src={user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                      className="w-8 h-8 rounded-full object-cover" 
                      alt="Profile" 
                    />
                  </div>
                </Link>
              </>
            ) : (
              <Link to="/login" className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 active:scale-95 transition-all shadow-soft">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 glass border-t-0 border-t border-border z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center w-full h-full"
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-muted hover:text-foreground'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
              </Link>
            );
          })}
          {user ? (
            <Link to="/profile" aria-label="Profile" className="relative flex flex-col items-center justify-center w-full h-full">
              <div className={`p-2 rounded-xl transition-all ${location.pathname.startsWith('/profile') ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-muted hover:text-foreground'}`}>
                <User className={`w-6 h-6 ${location.pathname.startsWith('/profile') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
            </Link>
          ) : (
            <Link to="/login" aria-label="Sign In" className="relative flex flex-col items-center justify-center w-full h-full">
              <div className={`p-2 rounded-xl transition-all ${location.pathname === '/login' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-muted hover:text-foreground'}`}>
                <User className="w-6 h-6 stroke-2" />
              </div>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};
