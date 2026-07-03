import React from 'react';
import { useTournaments } from '../hooks/useTournaments';
import { format } from 'date-fns';
import { Trophy, Calendar, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const Tournaments = () => {
 const { data: tournaments, isLoading } = useTournaments();

 const getSportBadgeClass = (sport: string) => {
 const s = sport.toLowerCase();
 if (s.includes('cricket')) return 'badge-cricket';
 if (s.includes('football') || s.includes('soccer')) return 'badge-football';
 if (s.includes('badminton')) return 'badge-badminton';
 if (s.includes('tennis')) return 'badge-tennis';
 if (s.includes('pickleball')) return 'badge-pickleball';
 if (s.includes('basketball')) return 'badge-basketball';
 return 'bg-zinc-100 text-zinc-700 ';
 };

 return (
 <div className="max-w-7xl mx-auto py-10 px-4">
 {/* Header */}
 <div className="flex justify-between items-end mb-10 border-b border-border pb-6">
 <div>
 <h1 className="text-3xl font-black text-foreground tracking-tight">Tournaments</h1>
 <p className="text-muted text-sm mt-1">Compete and win glory in local tournaments.</p>
 </div>
 </div>

 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3].map(i => (
 <div key={i} className="card-premium p-6 h-48 animate-pulse bg-surface"></div>
 ))}
 </div>
 ) : tournaments?.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {tournaments.map((t: any) => (
 <motion.div
 key={t.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="card-premium p-6 flex flex-col h-full bg-surface group"
 >
 <div className="flex justify-between items-start mb-4">
 <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg group-hover:scale-105 transition-transform">
 <Trophy className="w-5 h-5" />
 </div>
 <span className={`badge-premium ${getSportBadgeClass(t.sport)}`}>
 {t.sport}
 </span>
 </div>
 <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:underline transition-all text-foreground">
 {t.name}
 </h3>
 
 <div className="space-y-2 mt-auto text-xs font-semibold text-muted mb-4">
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4" /> {format(new Date(t.startDate), 'MMM d, yyyy')} - {format(new Date(t.endDate), 'MMM d')}
 </div>
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4" /> {t.location}
 </div>
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4" /> {t._count.participants} Participants
 </div>
 </div>

 <div className="pt-4 border-t border-border flex justify-between items-center text-xs font-bold">
 {t.entryFee ? (
 <span className="text-foreground">Entry: ₹{t.entryFee}</span>
 ) : (
 <span className="text-emerald-600 ">Free Entry</span>
 )}
 {t.prizePool && (
 <span className="text-amber-500">Prize: {t.prizePool}</span>
 )}
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="text-center py-20 bg-surface border border-border border-dashed rounded-2xl">
 <Trophy className="w-12 h-12 text-muted mx-auto mb-4" />
 <h3 className="text-lg font-bold text-foreground">No tournaments active</h3>
 <p className="text-muted text-sm">Check back later or organize your own!</p>
 </div>
 )}
 </div>
 );
};
