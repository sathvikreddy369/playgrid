import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useCommunityDetail, useJoinCommunity, useLeaveCommunity, 
  useKickMember, useApproveMember, useRejectMember, useUpdateMemberRole 
} from '../hooks/useCommunities';
import { ShareDialog } from '../components/ShareDialog';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { PostSkeleton, Skeleton } from '../components/Skeleton';
import { useAuth } from '../providers/AuthProvider';
import { ArrowLeft, Users, MapPin, CheckCircle, ShieldAlert, Lock, Settings, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserLink } from '../components/ui/UserLink';
import { useSocket } from '../hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

export const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: community, isLoading } = useCommunityDetail(id!);
  const { data: feedData, fetchNextPage, hasNextPage } = useFeed({ communityId: id });
  
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();
  const kickMember = useKickMember();
  const approveMember = useApproveMember();
  const rejectMember = useRejectMember();
  const updateRole = useUpdateMemberRole();
  const socket = useSocket();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'FEED' | 'MEMBERS' | 'EVENTS' | 'ADMIN'>('FEED');
  const [isShareOpen, setIsShareOpen] = useState(false);

  React.useEffect(() => {
    if (socket && id) {
      socket.emit('join_community', { communityId: id });

      socket.on('new_community_post', () => {
        queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      });

      socket.on('community_member_joined', () => {
        queryClient.invalidateQueries({ queryKey: ['communities', id] });
      });

      return () => {
        socket.emit('leave_community', { communityId: id });
        socket.off('new_community_post');
        socket.off('community_member_joined');
      };
    }
  }, [socket, id, queryClient]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-64 w-full card-premium" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4 pt-4">
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (!community) {
    return <div className="text-center py-20 font-bold text-muted text-sm animate-pulse">Community not found</div>;
  }

  const currentUserMembership = community.members?.find((m: any) => m.userId === user?.id);
  const isMember = currentUserMembership?.status === 'APPROVED';
  const isPending = currentUserMembership?.status === 'PENDING';
  const isOwner = community.ownerId === user?.id;
  const isAdmin = currentUserMembership?.role === 'ADMIN' || isOwner;

  const handleJoin = () => joinCommunity.mutate(id!);
  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave this community?")) {
      leaveCommunity.mutate(id!);
    }
  };
  
  const pendingMembers = community.members?.filter((m: any) => m.status === 'PENDING') || [];
  const approvedMembers = community.members?.filter((m: any) => m.status === 'APPROVED') || [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <button onClick={() => navigate('/communities')} className="flex items-center gap-2 text-muted hover:text-foreground font-semibold text-sm mb-8 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Communities
      </button>

      {/* Hero Section */}
      <div className="card-premium p-0 mb-8 relative overflow-hidden bg-surface rounded-2xl border-none shadow-sm">
        {/* Cover */}
        <div className="h-48 md:h-64 w-full bg-zinc-100 relative">
          {community.coverImage ? (
            <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
          )}
          
          <div className="absolute top-4 right-4 flex gap-2">
            {community.privacy === 'PRIVATE' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                <Lock className="w-3.5 h-3.5" /> Private
              </div>
            )}
            {community.status === 'VERIFIED' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </div>
            )}
          </div>
        </div>

        <div className="px-6 md:px-8 pb-8 pt-4 relative">
          {/* Avatar & Action Button */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 -mt-16 md:-mt-20 mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface border-4 border-surface shadow-md flex items-center justify-center overflow-hidden z-10 shrink-0">
              {community.avatarUrl ? (
                <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-10 h-10 text-muted" />
              )}
            </div>
            
            <div className="flex items-center gap-3 z-10">
              {user && !isOwner && (
                isMember ? (
                  <button onClick={handleLeave} className="btn-secondary">Leave</button>
                ) : isPending ? (
                  <button disabled className="btn-secondary opacity-50 cursor-not-allowed">Request Pending</button>
                ) : (
                  <button onClick={handleJoin} className="btn-primary">
                    {community.privacy === 'PRIVATE' ? 'Request to Join' : 'Join Community'}
                  </button>
                )
              )}
              <button 
                onClick={() => setIsShareOpen(true)}
                className="p-3 bg-surface border border-border hover:bg-zinc-50 rounded-xl transition-colors text-muted hover:text-foreground"
                title="Share Community"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
            {community.name}
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-3xl">
            {community.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            {community.sports?.map((sport: string) => (
              <span key={sport} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-md">
                {sport}
              </span>
            ))}
            {community.tags?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-foreground text-xs font-bold tracking-wider rounded-md">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 pt-6 border-t border-border/50 text-sm font-semibold text-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted" /> 
              {community._count.members} Members
            </div>
            {(community.primaryVenue?.location || community.location) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted" /> 
                {community.primaryVenue?.name || community.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              Owner: <UserLink userId={community.ownerId} className="hover:underline">{community.owner.name}</UserLink>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border overflow-x-auto no-scrollbar mb-8">
        {[
          { id: 'FEED', label: 'Posts' },
          { id: 'MEMBERS', label: 'Members' },
          { id: 'EVENTS', label: 'Events' },
          ...(isAdmin ? [{ id: 'ADMIN', label: 'Admin Settings' }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-bold transition-colors whitespace-nowrap relative cursor-pointer ${activeTab === tab.id ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
          >
            <span className="flex items-center gap-2">
              {tab.id === 'ADMIN' && <Settings className="w-4 h-4" />}
              {tab.label}
              {tab.id === 'ADMIN' && pendingMembers.length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{pendingMembers.length}</span>
              )}
            </span>
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
                {!isMember && community.privacy === 'PRIVATE' ? (
                  <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border">
                    <Lock className="w-8 h-8 text-muted mx-auto mb-4" />
                    <h3 className="font-bold text-foreground">Private Community</h3>
                    <p className="text-muted text-sm mt-1">Join to see posts and interact with members.</p>
                  </div>
                ) : (
                  <>
                    {!isMember && (
                      <div className="bg-zinc-100 text-foreground p-4 rounded-xl font-semibold text-xs border border-border mb-6 flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-muted" /> Join this community to interact and post.
                      </div>
                    )}
                    
                    {feedData?.pages.map((page, i) => (
                      <React.Fragment key={i}>
                        {page.posts.map((post: any) => <PostCard key={post.id} post={post} isCommunityOwner={isOwner} />)}
                      </React.Fragment>
                    ))}

                    {feedData?.pages[0]?.posts.length === 0 && (
                      <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                        <p className="text-muted text-xs font-semibold">No posts in this community yet.</p>
                      </div>
                    )}

                    {hasNextPage && (
                      <button onClick={() => fetchNextPage()} className="w-full btn-secondary mt-6">Load More</button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'MEMBERS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {approvedMembers.map((member: any) => (
                  <div key={member.userId} className="flex items-center justify-between card-premium p-4 group bg-surface rounded-xl">
                    <div className="flex items-center gap-3">
                      <UserLink userId={member.userId}>
                        <img src={member.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${member.user.name}&background=random`} alt={member.user.name} className="w-12 h-12 rounded-full border border-border object-cover" />
                      </UserLink>
                      <div>
                        <UserLink userId={member.userId}>
                          <p className="font-bold text-foreground text-sm hover:underline">{member.user.name}</p>
                        </UserLink>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            member.role === 'OWNER' ? 'bg-amber-100 text-amber-700' :
                            member.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                            member.role === 'MODERATOR' ? 'bg-purple-100 text-purple-700' :
                            'bg-zinc-100 text-muted'
                          }`}>
                            {member.role}
                          </span>
                          <span className="text-[10px] font-bold text-muted">★ {member.user.reputation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'EVENTS' && (
              <div className="text-center py-20 bg-surface border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🗓️</div>
                <h3 className="text-lg font-bold text-foreground mb-1">Events coming soon</h3>
                <p className="text-muted text-sm">Community matches and tournaments will appear here.</p>
              </div>
            )}

            {activeTab === 'ADMIN' && isAdmin && (
              <div className="space-y-8">
                {pendingMembers.length > 0 ? (
                  <div className="card-premium p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-4">Pending Requests</h3>
                    <div className="space-y-4">
                      {pendingMembers.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <img src={member.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${member.user.name}&background=random`} alt={member.user.name} className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="font-bold text-sm text-foreground">{member.user.name}</p>
                              <p className="text-[10px] text-muted font-bold">★ {member.user.reputation} Rep</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => approveMember.mutate({ communityId: id!, userId: member.userId })} className="btn-primary text-xs py-1.5 px-3">Approve</button>
                            <button onClick={() => rejectMember.mutate({ communityId: id!, userId: member.userId })} className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:text-red-600">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="card-premium p-6 text-center">
                    <p className="text-muted text-sm font-semibold">No pending join requests.</p>
                  </div>
                )}
                
                <div className="card-premium p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-4">Manage Members</h3>
                  <div className="space-y-3">
                    {approvedMembers.filter((m: any) => m.userId !== user?.id).map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">{member.user.name} <span className="text-xs text-muted ml-2">({member.role})</span></p>
                        <div className="flex gap-2">
                          {isOwner && member.role !== 'OWNER' && (
                            <select 
                              className="input-primary text-xs py-1.5 h-auto px-2"
                              value={member.role}
                              onChange={(e) => updateRole.mutate({ communityId: id!, userId: member.userId, role: e.target.value })}
                            >
                              <option value="MEMBER">Member</option>
                              <option value="MODERATOR">Moderator</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          )}
                          <button 
                            onClick={() => {
                              if (window.confirm("Kick this member?")) {
                                kickMember.mutate({ communityId: id!, userId: member.userId });
                              }
                            }}
                            className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:text-red-600"
                          >
                            Kick
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
      <ShareDialog 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        title={community?.name || 'Check out this community on PlayGrid'}
        url={window.location.href}
      />
    </div>
  );
};
