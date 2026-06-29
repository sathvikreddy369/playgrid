import React, { useState } from 'react';
import { useMatches, useMatchRecommendations } from '../hooks/useMatches';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Calendar, MapPin, Users, Activity } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { format } from 'date-fns';

import { motion } from 'framer-motion';

const MotionLink = motion(Link);

export const Matches = () => {
  const [filter, setFilter] = useState('OPEN');
  const { data: matches, isLoading } = useMatches({ status: filter });
  const { data: recommendations } = useMatchRecommendations();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Local Matches</h1>
          <p className="text-gray-500 dark:text-gray-400">Find and join games happening near you.</p>
        </div>
        {user && (
          <button 
            onClick={() => navigate('/matches/create')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Organize a Game
          </button>
        )}
      </div>

      {/* AI Recommendations */}
      {user && recommendations?.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-700">
            <span className="text-2xl">✨</span> Recommended for You
          </h2>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {recommendations.map((rec: any) => (
              <MotionLink 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                key={rec.match.id} 
                to={`/matches/${rec.match.id}`}
                className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 p-6 hover:shadow-md hover:border-purple-500 transition-all block relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full -mr-2 -mt-2"></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{rec.match.title}</h3>
                <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed font-medium">"{rec.reason}"</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <Calendar className="w-3 h-3" /> {format(new Date(rec.match.date), 'PPp')}
                </div>
              </MotionLink>
            ))}
          </motion.div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        {['OPEN', 'FULL', 'COMPLETED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-orange-100 text-orange-800 border-2 border-orange-200' : 'bg-white text-gray-500 border-2 border-transparent hover:bg-gray-100'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
        </div>
      ) : matches?.length > 0 ? (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {matches.map((match: any) => (
            <MotionLink 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              key={match.id} 
              to={`/matches/${match.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md hover:border-orange-500 transition-all group block"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                  {match.sport}
                </span>
                {match.community && (
                  <span className="text-xs text-gray-500 truncate max-w-[120px]" title={match.community.name}>
                    {match.community.name}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-orange-600 transition-colors">
                {match.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {format(new Date(match.date), 'PPp')}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> <span className="truncate">{match.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> {match._count.players} / {match.maxPlayers} Players
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Skill: {match.skillLevel}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                <span className="text-gray-500">By {match.creator.name}</span>
                {match.costPerPerson ? (
                  <span className="font-semibold text-gray-900 dark:text-white">₹{match.costPerPerson} / head</span>
                ) : (
                  <span className="font-semibold text-green-600">Free</span>
                )}
              </div>
            </MotionLink>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No matches found</h3>
          <p className="text-gray-500 mt-2">Try changing filters or organize your own game!</p>
        </div>
      )}
    </div>
  );
};
