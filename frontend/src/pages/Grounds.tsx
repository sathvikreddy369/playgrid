import React from 'react';
import { useGrounds } from '../hooks/useGrounds';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Plus } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

export const Grounds = () => {
  const { data: grounds, isLoading } = useGrounds('VERIFIED');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Sports Venues</h1>
          <p className="text-muted mt-1">Discover and book top-rated sports grounds near you.</p>
        </div>
        {user && (user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
          <button 
            onClick={() => navigate('/grounds/create')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> List Your Venue
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card overflow-hidden">
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
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {grounds.map((ground: any) => (
            <MotionLink 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              key={ground.id} 
              to={`/grounds/${ground.id}`}
              className="card overflow-hidden group flex flex-col h-full hover:border-green-500 hover:-translate-y-1 transition-all"
            >
              <div className="h-52 bg-muted/10 overflow-hidden relative">
                {ground.photos?.[0] ? (
                  <img src={ground.photos[0]} alt={ground.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
                    <MapPin className="w-8 h-8 opacity-50" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                {ground.pricing && (
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold text-foreground shadow-sm">
                    {ground.pricing}
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {ground.name}
                </h3>
                <div className="flex items-center gap-1.5 text-muted text-sm font-medium mb-4">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{ground.location}</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {ground.sports?.slice(0, 3).map((sport: string) => (
                    <span key={sport} className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-surface border border-border text-foreground rounded">
                      {sport}
                    </span>
                  ))}
                  {ground.sports?.length > 3 && (
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-surface border border-border text-muted rounded">
                      +{ground.sports.length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                   <div className="flex items-center gap-1.5 text-yellow-500">
                     <Star className="w-4 h-4 fill-current" />
                     <span className="font-bold text-foreground text-sm">
                       {ground._count.reviews > 0 ? 'Rated' : 'New Venue'}
                     </span>
                     {ground._count.reviews > 0 && (
                       <span className="text-muted text-xs font-medium">({ground._count.reviews} reviews)</span>
                     )}
                   </div>
                </div>
              </div>
            </MotionLink>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-surface/50 border border-border border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No venues found</h3>
          <p className="text-muted">Check back later for new ground listings.</p>
        </div>
      )}
    </div>
  );
};
