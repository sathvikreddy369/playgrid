import React from 'react';
import { useCommunities } from '../hooks/useCommunities';
import { Link, useNavigate } from 'react-router-dom';
import { Users, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

export const Communities = () => {
 const { data: communities, isLoading } = useCommunities('VERIFIED');
 const navigate = useNavigate();
 const { user } = useAuth();

 return (
 <div className="max-w-7xl mx-auto py-10 px-4">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-border pb-6">
 <div>
 <h1 className="text-3xl font-black text-foreground tracking-tight">Communities</h1>
 <p className="text-muted text-sm mt-1">Discover and join verified sports groups in your area.</p>
 </div>
 {user && (
 <button 
 onClick={() => navigate('/communities/create')}
 className="btn-primary inline-flex items-center gap-2"
 >
 <Plus className="w-4 h-4" /> Create Community
 </button>
 )}
 </div>

 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className="card-premium p-6 h-[180px] animate-pulse">
 <Skeleton className="h-6 w-3/4 mb-4" />
 <Skeleton className="h-4 w-full mb-2" />
 <Skeleton className="h-4 w-5/6 mb-6" />
 <div className="flex gap-4">
 <Skeleton className="h-4 w-24" />
 <Skeleton className="h-4 w-32" />
 </div>
 </div>
 ))}
 </div>
 ) : communities?.length > 0 ? (
 <motion.div 
 initial="hidden"
 animate="visible"
 variants={{
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
 }}
 className="grid grid-cols-1 md:grid-cols-2 gap-6"
 >
 {communities.map((community: any) => (
 <MotionLink 
 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
 key={community.id} 
 to={`/communities/${community.id}`}
 className="card-premium p-6 hover:border-zinc-400 transition-all group block h-full flex flex-col relative overflow-hidden bg-surface"
 >
 <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/5 rounded-bl-[100px] -z-10 group-hover:scale-105 transition-transform" />
 
 <h3 className="text-xl font-bold text-foreground group-hover:underline transition-colors mb-2 line-clamp-1">
 {community.name}
 </h3>
 
 <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
 {community.description}
 </p>
 
 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-auto pt-4 border-t border-border/50 text-xs font-semibold text-foreground">
 <div className="flex items-center gap-2">
 <div className="p-1.5 bg-zinc-100 text-foreground rounded-md">
 <Users className="w-3.5 h-3.5" />
 </div>
 <span>{community._count.members} Members</span>
 </div>
 
 {community.location && (
 <div className="flex items-center gap-2">
 <div className="p-1.5 bg-zinc-100 text-foreground rounded-md">
 <MapPin className="w-3.5 h-3.5" />
 </div>
 <span className="truncate max-w-[150px]">{community.location}</span>
 </div>
 )}
 </div>
 </MotionLink>
 ))}
 </motion.div>
 ) : (
 <div className="text-center py-20 bg-surface border border-border border-dashed rounded-2xl">
 <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
 <Users className="w-8 h-8 text-muted" />
 </div>
 <h3 className="text-lg font-bold text-foreground mb-1">No communities found</h3>
 <p className="text-muted text-sm">Check back later or create your own!</p>
 </div>
 )}
 </div>
 );
};
