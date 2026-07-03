import React, { useState } from 'react';
import { useCommunities } from '../hooks/useCommunities';
import { Link, useNavigate } from 'react-router-dom';
import { Users, MapPin, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

export const Communities = () => {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  
  // Using debounce for search would be ideal, but for now we'll pass it directly
  const { data: communities, isLoading } = useCommunities({ 
    search: search.length > 2 ? search : undefined,
    sport: sportFilter || undefined
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Communities</h1>
          <p className="text-muted text-sm mt-1">Discover and join vibrant sports groups.</p>
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search communities..." 
            className="input-primary pl-10 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <select 
            className="input-primary pl-10 w-full appearance-none"
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
          >
            <option value="">All Sports</option>
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
            <option value="Badminton">Badminton</option>
            <option value="Tennis">Tennis</option>
            <option value="Pickleball">Pickleball</option>
            <option value="Basketball">Basketball</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card-premium h-[300px] animate-pulse p-0 overflow-hidden">
              <div className="h-32 bg-zinc-100 dark:bg-zinc-800 w-full" />
              <div className="p-5">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {communities.map((community: any) => (
            <MotionLink 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              key={community.id} 
              to={`/communities/${community.id}`}
              className="card-premium p-0 hover:border-zinc-400 transition-all group block h-full flex flex-col relative overflow-hidden bg-surface rounded-2xl"
            >
              {/* Cover Image */}
              <div className="h-32 w-full bg-zinc-100 relative overflow-hidden">
                {community.coverImage ? (
                  <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
                )}
                {/* Privacy Badge */}
                {community.privacy === 'PRIVATE' && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded">
                    Private
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1 relative">
                {/* Avatar */}
                <div className="absolute -top-10 left-5 w-16 h-16 rounded-xl bg-surface border-4 border-surface overflow-hidden shadow-sm flex items-center justify-center">
                  {community.avatarUrl ? (
                    <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-muted" />
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-foreground group-hover:underline transition-colors mb-2 line-clamp-1">
                    {community.name}
                  </h3>
                  
                  <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-4">
                    {community.description}
                  </p>

                  {/* Sports Tags */}
                  {community.sports && community.sports.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {community.sports.slice(0, 3).map((sport: string) => (
                        <span key={sport} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
                          {sport}
                        </span>
                      ))}
                      {community.sports.length > 3 && (
                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-muted text-[10px] font-bold uppercase tracking-wider rounded">
                          +{community.sports.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-auto pt-4 border-t border-border/50 text-xs font-semibold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted" />
                    <span>{community._count.members} Members</span>
                  </div>
                  
                  {community.primaryVenue?.location ? (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted" />
                      <span className="truncate max-w-[120px]">{community.primaryVenue.location}</span>
                    </div>
                  ) : community.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted" />
                      <span className="truncate max-w-[120px]">{community.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </MotionLink>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-24 bg-surface border border-border border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No communities found</h3>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">We couldn't find any communities matching your criteria.</p>
          <button onClick={() => { setSearch(''); setSportFilter(''); }} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
