import React, { useState } from 'react';
import { useGrounds } from '../hooks/useGrounds';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Plus, Filter, Search } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

export const Grounds = () => {
 const [filters, setFilters] = useState({ status: 'VERIFIED', sport: '', location: '', minRating: 0 });
 const { data: grounds, isLoading } = useGrounds(filters);
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
 return 'bg-zinc-100 text-zinc-700 ';
 };

 return (
 <div className="max-w-7xl mx-auto py-10 px-4">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-border pb-6">
 <div>
 <h1 className="text-3xl font-black text-foreground tracking-tight">Sports Venues</h1>
 <p className="text-muted text-sm mt-1">Discover and book top-rated sports grounds near you.</p>
 </div>
 {user && (user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
 <button 
 onClick={() => navigate('/grounds/create')}
 className="btn-primary inline-flex items-center gap-2"
 >
 <Plus className="w-4 h-4" /> List Your Venue
 </button>
 )}
 </div>

 {/* Filters */}
 <div className="bg-surface border border-border rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center shadow-sm">
 <div className="flex items-center gap-2 text-muted font-bold text-sm mr-2">
 <Filter className="w-4 h-4" /> Filters:
 </div>

 <div className="flex-1 min-w-[200px] relative">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input
 type="text"
 placeholder="Search by location or city..."
 value={filters.location}
 onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
 className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
 />
 </div>

 <select
 value={filters.sport}
 onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
 className="bg-zinc-50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
 >
 <option value="">All Sports</option>
 <option value="Cricket">Cricket</option>
 <option value="Football">Football</option>
 <option value="Badminton">Badminton</option>
 <option value="Tennis">Tennis</option>
 <option value="Basketball">Basketball</option>
 <option value="Pickleball">Pickleball</option>
 </select>

 <select
 value={filters.minRating}
 onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
 className="bg-zinc-50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
 >
 <option value={0}>Any Rating</option>
 <option value={4}>4+ Stars</option>
 <option value={4.5}>4.5+ Stars</option>
 </select>
 </div>

 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3, 4, 5, 6].map(i => (
 <div key={i} className="card-premium overflow-hidden animate-pulse">
 <Skeleton className="h-48 w-full rounded-none" />
 <div className="p-5">
 <Skeleton className="h-6 w-3/4 mb-3" />
 <Skeleton className="h-4 w-1/2 mb-5" />
 <div className="flex gap-2">
 <Skeleton className="h-6 w-16 rounded" />
 <Skeleton className="h-6 w-16 rounded" />
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : grounds?.length > 0 ? (
 <motion.div 
 initial="hidden"
 animate="visible"
 variants={{
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
 }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 {grounds.map((ground: any) => (
 <MotionLink 
 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
 key={ground.id} 
 to={`/grounds/${ground.id}`}
 className="card-premium overflow-hidden group flex flex-col h-full hover:border-zinc-400 transition-all bg-surface"
 >
 <div className="h-52 bg-zinc-100 overflow-hidden relative">
 {ground.photos?.[0] ? (
 <img src={ground.photos[0]} alt={ground.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
 <MapPin className="w-8 h-8 opacity-50" />
 <span className="text-xs font-semibold">No image uploaded</span>
 </div>
 )}
 {ground.pricing && (
 <div className="absolute top-4 right-4 bg-zinc-950/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm border border-white/10">
 {ground.pricing}
 </div>
 )}
 </div>
 
 <div className="p-6 flex flex-col flex-1">
 <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1 group-hover:underline transition-colors">
 {ground.name}
 </h3>
 <div className="flex items-center gap-1.5 text-muted text-xs font-bold mb-4">
 <MapPin className="w-3.5 h-3.5 shrink-0" />
 <span className="truncate">{ground.location}</span>
 </div>
 
 <div className="flex flex-wrap gap-1.5 mb-6">
 {ground.sports?.slice(0, 3).map((sport: string) => (
 <span key={sport} className={`badge-premium ${getSportBadgeClass(sport)}`}>
 {sport}
 </span>
 ))}
 {ground.sports?.length > 3 && (
 <span className="text-[10px] font-bold text-muted bg-zinc-150 px-2 py-0.5 rounded-full border border-border">
 +{ground.sports.length - 3} more
 </span>
 )}
 </div>

 <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs font-bold">
 <div className="flex items-center gap-1.5 text-amber-500">
 <Star className="w-4 h-4 fill-current text-amber-500" />
 <span className="text-foreground font-bold">
 {ground.avgRating > 0 ? ground.avgRating.toFixed(1) : 'New'}
 </span>
 {ground._count.reviews > 0 && (
 <span className="text-muted font-semibold">({ground._count.reviews} reviews)</span>
 )}
 </div>
 </div>
 </div>
 </MotionLink>
 ))}
 </motion.div>
 ) : (
 <div className="text-center py-20 bg-surface border border-border border-dashed rounded-2xl">
 <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
 <MapPin className="w-8 h-8 text-muted" />
 </div>
 <h3 className="text-lg font-bold text-foreground mb-1">No venues found</h3>
 <p className="text-muted text-sm">Check back later for new ground listings.</p>
 </div>
 )}
 </div>
 );
};
