import React, { useEffect, useState } from 'react';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { CreatePostForm } from '../components/CreatePostForm';
import { PostSkeleton } from '../components/Skeleton';
import { useInView } from 'react-intersection-observer';
import { Loader2, Filter, Search } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { motion } from 'framer-motion';

export const Feed = () => {
 const { user } = useAuth();
 const [filters, setFilters] = useState({ type: '', location: '' });

 const {
 data,
 fetchNextPage,
 hasNextPage,
 isFetchingNextPage,
 status,
 } = useFeed(filters);

 const { ref, inView } = useInView();

 useEffect(() => {
 if (inView && hasNextPage) {
 fetchNextPage();
 }
 }, [inView, hasNextPage, fetchNextPage]);

 return (
 <div className="max-w-2xl mx-auto py-10 px-4 w-full">
 <motion.div 
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-8"
 >
 <h1 className="text-2xl font-black tracking-tight text-foreground">Community Feed</h1>
 <p className="text-xs font-semibold text-muted mt-1">See what players are talking about in your area.</p>
 </motion.div>

 {user && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
 <CreatePostForm />
 </motion.div>
 )}

 {/* Filters */}
 <div className="bg-surface border border-border rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center shadow-sm">
   <div className="flex items-center gap-2 text-muted font-bold text-sm mr-2">
     <Filter className="w-4 h-4" /> Filters:
   </div>
   
   <div className="flex-1 min-w-[200px] relative">
     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
     <input
       type="text"
       placeholder="Search by location..."
       value={filters.location}
       onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
       className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
     />
   </div>
   
   <select
     value={filters.type}
     onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
     className="bg-zinc-50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
   >
     <option value="">All Types</option>
     <option value="GENERAL">General</option>
     <option value="LOOKING_FOR_PLAYERS">Looking for Players</option>
     <option value="LOOKING_FOR_TEAM">Looking for Team</option>
     <option value="TOURNAMENT_ANNOUNCEMENT">Tournament Announcement</option>
     <option value="GROUND_PROMOTION">Ground Promotion</option>
     <option value="QUESTION">Question</option>
     <option value="EQUIPMENT">Equipment</option>
     <option value="TRAINING">Training</option>
   </select>
 </div>

 <div className="space-y-4">
 {status === 'pending' ? (
 <div className="py-4 space-y-4">
 <PostSkeleton />
 <PostSkeleton />
 <PostSkeleton />
 </div>
 ) : status === 'error' ? (
 <div className="text-center p-8 bg-red-50 rounded-xl text-red-500 text-xs font-semibold">
 Error loading feed. Please try again.
 </div>
 ) : (
 <>
 {data.pages.map((page, i) => (
 <React.Fragment key={i}>
 {page.posts.map((post: any) => (
 <PostCard key={post.id} post={post} />
 ))}
 </React.Fragment>
 ))}
 
 <div ref={ref} className="py-8 flex justify-center">
 {isFetchingNextPage ? (
 <Loader2 className="w-6 h-6 animate-spin text-foreground" />
 ) : hasNextPage ? (
 <span className="text-xs font-bold text-muted">Scroll for more</span>
 ) : (
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted bg-surface px-4 py-2 rounded-full border border-border">You've caught up! 🎉</span>
 )}
 </div>
 </>
 )}
 </div>
 </div>
 );
};
