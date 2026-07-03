import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { NotificationBell } from './NotificationBell';
import { Home, Search, Users, Calendar, MessageSquare, Compass, Menu, X, ChevronRight, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { signOut } from '../lib/firebase';

export const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Logout error from layout:', err);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll for dynamic header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Discover' },
    { path: '/matches', icon: Calendar, label: 'Matches' },
    { path: '/communities', icon: Users, label: 'Clubs' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground transition-colors duration-300">
      
      {/* Top Header */}
      <header 
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-surface/90 backdrop-blur-md border-b border-border shadow-sm py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 group"
              aria-label="Playgrid Home"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-6 h-6 stroke-[2.5px]" />
              </div>
              <span className="text-2xl font-black tracking-tight hidden sm:block">
                Playgrid
              </span>
            </Link>

            {/* Desktop Primary Nav */}
            <nav className="hidden lg:flex items-center gap-1 bg-surface border border-border p-1.5 rounded-2xl shadow-sm">
              {primaryNavItems.map(item => {
                const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                return (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
                      isActive 
                        ? 'text-foreground' 
                        : 'text-muted hover:text-foreground hover:bg-zinc-100'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 bg-zinc-100 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link to="/search" className="lg:hidden p-2 text-muted hover:bg-zinc-100 rounded-full transition-colors">
                  <Search className="w-6 h-6" />
                </Link>

                <NotificationBell />
                
                <Link to="/messages" className="relative p-2 text-muted hover:bg-zinc-100 rounded-full transition-colors hidden sm:block">
                  <MessageSquare className="w-6 h-6" />
                </Link>

                {/* User Dropdown / Profile Link */}
                <Link to="/profile" className="hidden sm:block ml-2 group relative">
                  <Avatar 
                    src={user.profile?.avatarUrl || undefined} 
                    fallback={user.name} 
                    size="md"
                    className="ring-2 ring-transparent group-hover:ring-primary-500 transition-all cursor-pointer" 
                  />
                </Link>

                {/* Mobile Menu Toggle */}
                <button 
                  className="sm:hidden p-2 -mr-2 text-foreground"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open Menu"
                >
                  <Menu className="w-7 h-7" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hidden sm:block text-sm font-bold text-muted hover:text-foreground transition-colors">
                  Log In
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="rounded-full px-5">
                    Join Playgrid
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20 pb-24 md:pb-12 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex-1 flex flex-col items-center"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-surface/90 backdrop-blur-xl border-t border-border z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center w-full h-full"
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'stroke-[2.5px] text-primary-600 translate-y-[-2px]' : 'stroke-2 text-muted'}`} />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="w-1 h-1 rounded-full bg-primary-600 absolute bottom-1"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Side Menu (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 sm:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-surface z-50 sm:hidden flex flex-col shadow-2xl border-l border-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-black">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-muted hover:bg-zinc-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {user ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-4 group">
                      <Avatar src={user.profile?.avatarUrl || undefined} fallback={user.name} size="lg" />
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">{user.name}</h3>
                        <p className="text-sm text-muted">View Profile</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted ml-auto" />
                    </Link>
                    
                    <div className="h-px bg-border w-full" />

                    <div className="space-y-2">
                      <Link to="/messages" className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-base">Messages</span>
                      </Link>
                      
                      <Link to="/settings" className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center">
                          <SettingsIcon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-base">Settings</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Not Logged In</h3>
                      <p className="text-sm text-muted mt-1">Join to connect with players.</p>
                    </div>
                    <Link to="/login" className="block mt-4">
                      <Button variant="primary" className="w-full">Sign In / Register</Button>
                    </Link>
                  </div>
                )}
              </div>

              {user && (
                <div className="p-6 border-t border-border">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
