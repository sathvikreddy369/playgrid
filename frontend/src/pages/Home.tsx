import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { Loader2, ArrowRight } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();
  
  // Fetch latest posts for the "Activity Feed" preview
  const { data, isLoading } = useFeed({});

  const posts = data?.pages[0]?.posts?.slice(0, 5) || [];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full text-center space-y-6 mt-8 md:mt-16 px-4"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Welcome to <span className="text-blue-600 dark:text-blue-500">Playgrid</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
          Your ultimate sports community platform. Find players, build communities, and play more.
        </p>
        
        {user ? (
          <div className="flex justify-center gap-3 md:gap-4 flex-wrap max-w-3xl mx-auto mt-8">
            <Link to="/search" className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 px-6 py-2.5 md:px-8 md:py-3 rounded-full font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm w-full sm:w-auto">Global Search</Link>
            <Link to="/matches" className="bg-orange-600 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full font-medium hover:bg-orange-700 transition-colors shadow-sm w-full sm:w-auto">Find Matches</Link>
            <Link to="/communities" className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 px-6 py-2.5 md:px-8 md:py-3 rounded-full font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm w-full sm:w-auto">Communities</Link>
            <Link to="/grounds" className="bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-500 px-6 py-2.5 md:px-8 md:py-3 rounded-full font-medium hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm w-full sm:w-auto">Venues</Link>
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mt-8">
            <Link to="/login" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 md:px-10 md:py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Activity Feed Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-4xl mx-auto mt-16 md:mt-24 px-4 pb-16"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          {user && (
            <Link to="/feed" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
              View Feed <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No recent activity found. Check back later!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
