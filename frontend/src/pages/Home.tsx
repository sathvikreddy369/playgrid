import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/Skeleton';
import { ArrowRight, Search, Users, Calendar, MapPin } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();
  
  // Fetch latest posts for the "Activity Feed" preview
  const { data, isLoading } = useFeed({});

  const posts = data?.pages[0]?.posts?.slice(0, 5) || [];

  const ActionButton = ({ to, icon: Icon, label, colorClass }: { to: string, icon: any, label: string, colorClass: string }) => (
    <Link 
      to={to} 
      className={`group relative flex items-center justify-center gap-3 px-6 py-4 bg-surface border border-border rounded-2xl font-semibold transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden w-full sm:w-auto`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${colorClass}`} />
      <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      <span className="text-foreground relative z-10">{label}</span>
    </Link>
  );

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="relative w-full max-w-5xl mx-auto mt-12 md:mt-24 px-4 text-center">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-2 border border-primary-100 dark:border-primary-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Playgrid Beta is Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.1]">
            Connect. Organize. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-600">Play More.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            The modern platform to find local players, organize matches, and build sports communities.
          </p>
          
          {user ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto mt-12"
            >
              <ActionButton to="/search" icon={Search} label="Find Players" colorClass="bg-blue-500" />
              <ActionButton to="/matches" icon={Calendar} label="Browse Matches" colorClass="bg-orange-500" />
              <ActionButton to="/communities" icon={Users} label="Join Groups" colorClass="bg-purple-500" />
              <ActionButton to="/grounds" icon={MapPin} label="Discover Venues" colorClass="bg-green-500" />
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mt-8">
              <Link to="/login" className="flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 active:scale-95">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Activity Feed Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl mx-auto mt-24 md:mt-32 px-4 pb-20"
      >
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Activity Stream</h2>
            <p className="text-muted text-sm mt-1">See what's happening around you</p>
          </div>
          {user && (
            <Link to="/feed" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length > 0 ? (
            posts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 bg-surface rounded-2xl border border-border border-dashed">
              <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">It's quiet here</h3>
              <p className="text-muted">No recent activity found. Check back later!</p>
            </div>
          )}
        </div>
        
        {user && posts.length > 0 && (
          <div className="mt-8 text-center sm:hidden">
            <Link to="/feed" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-full transition-colors">
              View full feed <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};
