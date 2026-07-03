import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Skeleton } from './Skeleton';
import { Activity, Calendar, MapPin, MessageSquare, Shield, Trophy, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'MATCH_CREATED':
    case 'MATCH_JOINED':
      return <Calendar className="w-4 h-4 text-orange-500" />;
    case 'COMMUNITY_CREATED':
    case 'COMMUNITY_JOINED':
      return <Shield className="w-4 h-4 text-blue-500" />;
    case 'POST_CREATED':
    case 'COMMENT_ADDED':
      return <MessageSquare className="w-4 h-4 text-purple-500" />;
    case 'GROUND_REVIEWED':
      return <MapPin className="w-4 h-4 text-green-500" />;
    case 'BADGE_EARNED':
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'FRIEND_ADDED':
      return <UserPlus className="w-4 h-4 text-blue-500" />;
    default:
      return <Activity className="w-4 h-4 text-muted" />;
  }
};

const getActivityText = (type: string) => {
  switch (type) {
    case 'MATCH_CREATED': return 'Hosted a new match';
    case 'MATCH_JOINED': return 'Joined a match';
    case 'COMMUNITY_CREATED': return 'Created a community';
    case 'COMMUNITY_JOINED': return 'Joined a community';
    case 'POST_CREATED': return 'Published a post';
    case 'COMMENT_ADDED': return 'Commented on a post';
    case 'GROUND_REVIEWED': return 'Reviewed a venue';
    case 'BADGE_EARNED': return 'Earned a new badge';
    case 'FRIEND_ADDED': return 'Made a new connection';
    default: return 'Performed an activity';
  }
};

export const ActivityFeed = ({ userId }: { userId: string }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['userFeed', userId],
    queryFn: async () => (await api.get(`/users/${userId}/feed`)).data,
    enabled: !!userId,
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 items-start bg-surface p-4 rounded-2xl border border-border">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-16 bg-surface border border-border border-dashed rounded-2xl">
        <Activity className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
        <h3 className="font-bold text-foreground text-sm">Your feed is quiet</h3>
        <p className="text-xs text-muted mt-1">Connect with friends and join communities to see activity here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any, index: number) => (
        <motion.div 
          key={activity.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.5) }}
          className="card-premium bg-surface p-4 md:p-5 flex gap-4 items-start"
        >
          <Link to={`/profile/${activity.user.id}`} className="relative shrink-0 group">
            <img 
              src={activity.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${activity.user.name}&background=random`} 
              alt={activity.user.name} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-border group-hover:opacity-80 transition-opacity" 
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface border-2 border-surface rounded-full flex items-center justify-center shadow-sm">
              {getActivityIcon(activity.type)}
            </div>
          </Link>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm text-foreground">
              <Link to={`/profile/${activity.user.id}`} className="font-bold hover:underline">{activity.user.name}</Link>
              {' '}<span className="text-muted font-medium">{getActivityText(activity.type).toLowerCase()}</span>
            </p>
            
            {activity.entityId && (
              <div className="mt-2 text-sm bg-zinc-50 border border-border rounded-xl p-3">
                {/* Try to render something contextual based on metadata if available, otherwise just generic link */}
                {activity.metadata?.title ? (
                  <p className="font-bold text-foreground truncate">{activity.metadata.title}</p>
                ) : (
                  <p className="text-muted text-xs italic">View details...</p>
                )}
              </div>
            )}
            
            <p className="text-[10px] uppercase font-bold text-muted mt-3 flex items-center gap-1.5">
               {formatDistanceToNow(new Date(activity.createdAt))} ago
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
