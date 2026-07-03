import React, { useState } from 'react';
import { useMatches, useMatchRecommendations } from '../hooks/useMatches';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Activity, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { format } from 'date-fns';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';
import type { Match } from '../types';

const MotionLink = motion.create(Link);

export const Matches = () => {
 const [filter, setFilter] = useState('OPEN');
 const [dateFilter, setDateFilter] = useState('');
 const { data: matches, isLoading } = useMatches({ status: filter, date: dateFilter });
 const { data: recommendations } = useMatchRecommendations();
 const navigate = useNavigate();
 const { user } = useAuth();

 const getSportBadgeClass = (sport: string) => {
 const s = sport.toLowerCase();
 if (s.includes('cricket')) return 'badge-cricket';
 if (s.includes('football') || s.includes('soccer')) return 'badge-football';
 if (s.includes('badminton')) return 'badge-badminton';
 if (s.includes('tennis')) return 'badge-tennis';
 if (s.includes('pickleball')) return 'badge-pickleball';
 if (s.includes('basketball')) return 'badge-basketball';
 return 'bg-zinc-150 text-zinc-700 ';
 };

 return (
 <div className="max-w-7xl mx-auto py-10 px-4">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-border pb-6">
 <div>
 <h1 className="text-3xl font-black text-foreground tracking-tight">Game Discovery</h1>
 <p className="text-muted text-sm mt-1">Explore, join, or host matches in your local community.</p>
 </div>
 {user && (
 <button 
 onClick={() => navigate('/matches/create')}
 className="btn-primary inline-flex items-center gap-2"
 >
 <Plus className="w-4 h-4" /> Host a Match
 </button>
 )}
 </div>

 {/* AI Recommendations */}
 {user && recommendations?.length > 0 && (
 <div className="mb-12">
 <h2 className="text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-1.5 text-zinc-950 ">
 <Sparkles className="w-4 h-4 text-amber-500" /> Recommended For You
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {recommendations.map((rec: { match: Match, reason: string }, i: number) => (
 <MotionLink 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 key={rec.match.id} 
 to={`/matches/${rec.match.id}`}
 className="group relative bg-surface border border-border rounded-2xl p-6 hover:shadow-soft transition-all overflow-hidden block"
 >
 <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
 <h3 className="text-base font-bold text-foreground mb-2 group-hover:underline transition-all">{rec.match.title}</h3>
 <p className="text-xs text-muted leading-relaxed font-medium italic">"{rec.reason}"</p>
 <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted">
 <Calendar className="w-3.5 h-3.5" /> {format(new Date(rec.match.date), 'PPp')}
 </div>
 </MotionLink>
 ))}
 </div>
 </div>
 )}

  {/* Filter Tabs */}
  <div className="flex flex-col sm:flex-row gap-4 mb-8">
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
    {['OPEN', 'FULL', 'COMPLETED'].map(f => (
    <button
    key={f}
    onClick={() => setFilter(f)}
    className={`px-5 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
    filter === f 
    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' 
    : 'bg-surface text-muted hover:bg-zinc-50 border-border'
    }`}
    >
    {f}
    </button>
    ))}
    </div>
    
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
    {[
      { value: '', label: 'Any Date' },
      { value: 'today', label: 'Today' },
      { value: 'tomorrow', label: 'Tomorrow' },
      { value: 'weekend', label: 'This Weekend' }
    ].map(d => (
      <button
        key={d.value}
        onClick={() => setDateFilter(d.value)}
        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap cursor-pointer ${
          dateFilter === d.value
          ? 'bg-primary-50 text-primary-700 border-primary-200'
          : 'bg-surface text-muted hover:bg-zinc-50 border-border'
        }`}
      >
        {d.label}
      </button>
    ))}
    </div>
  </div>

 {/* Matches Grid */}
 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3, 4, 5, 6].map(i => (
 <div key={i} className="card-premium p-6 h-[260px] animate-pulse">
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
 visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
 }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 {matches.map((match: Match) => (
 <MotionLink 
 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
 key={match.id} 
 to={`/matches/${match.id}`}
 className="card-premium p-6 group flex flex-col h-full"
 >
 <div className="flex justify-between items-start mb-4 gap-2">
 <span className={`badge-premium ${getSportBadgeClass(match.sport)}`}>
 {match.sport}
 </span>
 {match.community && (
 <span className="text-[11px] font-semibold text-muted bg-zinc-100 px-2 py-0.5 rounded-md truncate max-w-[120px]" title={match.community.name}>
 {match.community.name}
 </span>
 )}
 </div>

 <h3 className="text-lg font-bold text-foreground mb-4 group-hover:underline transition-all line-clamp-2">
 {match.title}
 </h3>
 
 <div className="space-y-2.5 text-xs font-semibold text-muted mt-auto mb-6">
 <div className="flex items-center gap-2.5">
 <Calendar className="w-4 h-4 shrink-0" /> <span className="truncate">{format(new Date(match.date), 'PPp')}</span>
 </div>
 <div className="flex items-center gap-2.5">
 <MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{match.location}</span>
 </div>
 <div className="flex items-center gap-2.5">
 <Users className="w-4 h-4 shrink-0" /> {match._count?.players || 0} / {match.maxPlayers} Players
 </div>
 <div className="flex items-center gap-2.5">
 <Activity className="w-4 h-4 shrink-0" /> Level: {match.skillLevel}
 </div>
 </div>

 <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
 <div className="flex items-center gap-2">
 <img src={`https://ui-avatars.com/api/?name=${match.creator?.name || 'User'}&background=random`} className="w-6 h-6 rounded-full" alt={match.creator?.name || 'User'} />
 <span className="font-semibold text-foreground truncate max-w-[100px]">{match.creator?.name || 'User'}</span>
 </div>
 {match.costPerPerson ? (
 <span className="font-bold text-foreground bg-zinc-100 px-2.5 py-1 rounded-md">₹{match.costPerPerson}</span>
 ) : (
 <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">Free</span>
 )}
 </div>
 </MotionLink>
 ))}
 </motion.div>
 ) : (
 <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
 <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
 <Calendar className="w-8 h-8 text-muted" />
 </div>
 <h3 className="text-lg font-bold text-foreground mb-1">No matches found</h3>
 <p className="text-muted text-sm">Try changing filters or organize your own game!</p>
 </div>
 )}
 </div>
 );
};
