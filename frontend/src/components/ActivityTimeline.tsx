import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Skeleton } from './Skeleton';
import { Activity, Calendar, MapPin, MessageSquare, Shield, Trophy } from 'lucide-react';

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
      return <Trophy className="w-4 h-4 text-emerald-500" />;
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

export const ActivityTimeline = ({ userId }: { userId: string }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['userActivities', userId],
    queryFn: async () => (await api.get(`/users/${userId}/activities`)).data,
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 items-start">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return <div className="text-center py-10 text-muted font-bold text-sm">No recent activity.</div>;
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {activities.map((activity: any, index: number) => (
        <motion.div 
          key={activity.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-surface bg-zinc-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {getActivityIcon(activity.type)}
          </div>
          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] card-premium bg-surface p-4">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              {getActivityText(activity.type)}
            </h4>
            <span className="text-[10px] uppercase font-bold text-muted mt-2 block">
              {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
