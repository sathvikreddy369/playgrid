import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunityDetail, useJoinCommunity, useLeaveCommunity, useKickMember } from '../hooks/useCommunities';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { PostSkeleton, Skeleton } from '../components/Skeleton';
import { useAuth } from '../providers/AuthProvider';
import { ArrowLeft, Users, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: community, isLoading } = useCommunityDetail(id!);
  const { data: feedData, fetchNextPage, hasNextPage } = useFeed({ communityId: id });
  
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();
  const kickMember = useKickMember();

  const [activeTab, setActiveTab] = useState<'FEED' | 'MEMBERS' | 'EVENTS'>('FEED');

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-48 w-full card" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4 pt-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (!community) {
    return <div className="text-center py-20 font-medium text-muted">Community not found</div>;
  }

  const isMember = community.members?.some((m: any) => m.userId === user?.id);
  const isOwner = community.ownerId === user?.id;
  const isAdmin = user?.role === 'ADMIN';

  const handleJoin = () => joinCommunity.mutate(id!);
  const handleLeave = () => leaveCommunity.mutate(id!);
  const handleKick = (userId: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      kickMember.mutate({ communityId: id!, userId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button onClick={() => navigate('/communities')} className="flex items-center gap-2 text-muted hover:text-foreground font-medium mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Communities
      </button>

      {/* Header */}
      <div className="card p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-bl-[200px] -z-10 pointer-events-none" />
        
        {community.status === 'PENDING' && (
          <div className="absolute top-0 left-0 w-full bg-yellow-500 text-white text-center text-xs uppercase tracking-wider font-bold py-1.5 shadow-sm">
            Pending Admin Verification
          </div>
        )}
        
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${community.status === 'PENDING' ? 'mt-6' : ''}`}>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-3">
              {community.name}
              {community.status === 'VERIFIED' && <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />}
            </h1>
            <p className="text-muted mt-3 text-[17px] leading-relaxed max-w-2xl">{community.description}</p>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-sm font-bold text-foreground">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md">
                  <Users className="w-4 h-4" /> 
                </div>
                {community._count.members} Members
              </div>
              {community.location && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-surface border border-border text-muted rounded-md">
                    <MapPin className="w-4 h-4" /> 
                  </div>
                  {community.location}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full text-muted">
                Created by {community.owner.name}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {user && !isOwner && (
              isMember ? (
                <button onClick={handleLeave} className="w-full md:w-auto px-8 py-3 bg-surface border border-border rounded-full font-bold hover:bg-border transition-colors text-foreground active:scale-95 shadow-sm">Leave</button>
              ) : (
                <button onClick={handleJoin} className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-colors active:scale-95 shadow-sm">Join Community</button>
              )
            )}
            {isOwner && (
              <div className="px-6 py-2.5 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-bold rounded-full border border-primary-200 dark:border-primary-800">
                You are the Owner
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border overflow-x-auto no-scrollbar mb-8">
        {[
          { id: 'FEED', label: 'Posts' },
          { id: 'MEMBERS', label: 'Members' },
          { id: 'EVENTS', label: 'Events' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-bold transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="community-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'FEED' && (
              <div className="space-y-4">
                {!isMember && (
                  <div className="bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 p-4 rounded-xl font-medium border border-primary-100 dark:border-primary-900/50 mb-6 flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5" /> Join this community to interact and post.
                  </div>
                )}
                
                {feedData?.pages.map((page, i) => (
                  <React.Fragment key={i}>
                    {page.posts.map((post: any) => <PostCard key={post.id} post={post} isCommunityOwner={isOwner} />)}
                  </React.Fragment>
                ))}

                {feedData?.pages[0]?.posts.length === 0 && (
                  <div className="text-center py-16 bg-surface/50 rounded-2xl border border-dashed border-border">
                    <p className="text-muted font-medium">No posts in this community yet.</p>
                  </div>
                )}

                {hasNextPage && (
                  <button onClick={() => fetchNextPage()} className="w-full py-3 bg-surface border border-border text-foreground font-bold hover:bg-border/50 rounded-full transition-colors mt-6 shadow-sm">Load More</button>
                )}
              </div>
            )}

            {activeTab === 'MEMBERS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {community.members.map((member: any) => (
                  <div key={member.userId} className="flex items-center justify-between card p-4 group">
                    <div className="flex items-center gap-3">
                      <img src={member.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${member.user.name}`} alt={member.user.name} className="w-10 h-10 rounded-full bg-border" />
                      <div>
                        <p className="font-bold text-foreground">{member.user.name}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted mt-0.5">{member.user.role}</p>
                      </div>
                    </div>
                    {(isOwner || isAdmin) && member.userId !== community.ownerId && (
                      <button onClick={() => handleKick(member.userId)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        Remove
                      </button>
                    )}
                    {member.userId === community.ownerId && (
                      <span className="text-[10px] bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 font-bold uppercase tracking-wider px-2 py-1 rounded">Owner</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'EVENTS' && (
              <div className="text-center py-20 bg-surface/50 border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🗓️</div>
                <h3 className="text-lg font-bold text-foreground mb-1">Events coming soon</h3>
                <p className="text-muted font-medium">This feature is planned for a future phase.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
