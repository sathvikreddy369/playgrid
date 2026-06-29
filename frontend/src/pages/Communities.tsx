import React from 'react';
import { useCommunities } from '../hooks/useCommunities';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Users, MapPin } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

import { motion } from 'framer-motion';

const MotionLink = motion(Link);

export const Communities = () => {
  const { data: communities, isLoading } = useCommunities('VERIFIED');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communities</h1>
          <p className="text-gray-500 dark:text-gray-400">Discover and join verified sports communities.</p>
        </div>
        {user && (
          <button 
            onClick={() => navigate('/communities/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Create Community
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : communities?.length > 0 ? (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {communities.map((community: any) => (
            <MotionLink 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              key={community.id} 
              to={`/communities/${community.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:border-blue-500 transition-colors group block"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{community.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{community.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{community._count.members} Members</span>
                </div>
                {community.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{community.location}</span>
                  </div>
                )}
              </div>
            </MotionLink>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No communities found</h3>
          <p className="text-gray-500 mt-2">Check back later or create your own!</p>
        </div>
      )}
    </div>
  );
};
