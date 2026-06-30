import React, { useState } from 'react';
import { useMatches, useMatchRecommendations } from '../hooks/useMatches';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Activity, Plus } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { format } from 'date-fns';
import { Skeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import type { Match } from '../types';

const MotionLink = motion.create(Link);

export const Matches = () => {
  const [filter, setFilter] = useState('OPEN');
  const { data: matches, isLoading } = useMatches({ status: filter });
  const { data: recommendations } = useMatchRecommendations();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Local Matches</h1>
          <p className="text-muted mt-1">Find and join games happening near you.</p>
        </div>
        {user && (
          <button 
            onClick={() => navigate('/matches/create')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Organize a Game
          </button>
        )}
      </div>

      {/* AI Recommendations */}
      {user && recommendations?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <span className="text-lg">✨</span> Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec: { match: Match, reason: string }, i: number) => (
              <MotionLink 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={rec.match.id} 
                to={`/matches/${rec.match.id}`}
                className="group relative bg-gradient-to-br from-purple-50 to-background dark:from-purple-900/10 dark:to-surface rounded-2xl shadow-sm border border-purple-200 dark:border-purple-800/50 p-6 hover:shadow-md transition-all overflow-hidden block"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{rec.match.title}</h3>
                <p className="text-sm text-muted font-medium italic">"{rec.reason}"</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-600/70 dark:text-purple-400/70">
                  <Calendar className="w-3.5 h-3.5" /> {format(new Date(rec.match.date), 'PPp')}
                </div>
              </MotionLink>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {['OPEN', 'FULL', 'COMPLETED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              filter === f 
                ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 ring-2 ring-orange-500/20' 
                : 'bg-surface text-muted hover:bg-border border border-border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card p-6 h-[260px]">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          ))}
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
          {matches.map((match: Match) => (
            <MotionLink 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              key={match.id} 
              to={`/matches/${match.id}`}
              className="card p-6 group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <span className="px-2.5 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] font-black uppercase tracking-wider rounded-md shrink-0">
                  {match.sport}
                </span>
                {match.community && (
                  <span className="text-[11px] font-semibold text-muted bg-surface border border-border px-2 py-0.5 rounded-md truncate max-w-[120px]" title={match.community.name}>
                    {match.community.name}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-orange-500 transition-colors line-clamp-2">
                {match.title}
              </h3>
              
              <div className="space-y-2.5 text-sm font-medium text-muted mt-auto mb-6">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 shrink-0" /> <span className="truncate">{format(new Date(match.date), 'PPp')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{match.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0" /> {match._count.players} / {match.maxPlayers} Players
                </div>
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 shrink-0" /> Skill: {match.skillLevel}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <img src={`https://ui-avatars.com/api/?name=${match.creator.name}`} className="w-6 h-6 rounded-full" alt={match.creator.name} />
                  <span className="font-semibold text-foreground truncate max-w-[100px]">{match.creator.name}</span>
                </div>
                {match.costPerPerson ? (
                  <span className="font-bold text-foreground bg-surface border border-border px-2.5 py-1 rounded-md">₹{match.costPerPerson}</span>
                ) : (
                  <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-md">Free</span>
                )}
              </div>
            </MotionLink>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-surface/50 rounded-2xl border border-border border-dashed">
          <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No matches found</h3>
          <p className="text-muted">Try changing filters or organize your own game!</p>
        </div>
      )}
    </div>
  );
};
