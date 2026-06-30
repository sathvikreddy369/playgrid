import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunityDetail, useJoinCommunity, useLeaveCommunity, useKickMember } from '../hooks/useCommunities';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../providers/AuthProvider';
import { Loader2, ArrowLeft, Users, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';

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
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  if (!community) {
    return <div className="text-center py-20 font-bold text-xl">Community not found</div>;
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
      <button onClick={() => navigate('/communities')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5" /> Back to Communities
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-6 relative overflow-hidden">
        {community.status === 'PENDING' && (
          <div className="absolute top-0 left-0 w-full bg-yellow-500 text-white text-center text-sm py-1 font-medium">
            Pending Admin Verification
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {community.name}
              {community.status === 'VERIFIED' && <CheckCircle className="w-6 h-6 text-green-500" />}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">{community.description}</p>
            
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {community._count.members} Members</div>
              {community.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {community.location}</div>}
              <div>Created by {community.owner.name}</div>
            </div>
          </div>

          <div>
            {user && !isOwner && (
              isMember ? (
                <button onClick={handleLeave} className="px-6 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 text-gray-700">Leave</button>
              ) : (
                <button onClick={handleJoin} className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700">Join Community</button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 mb-6">
        {['FEED', 'MEMBERS', 'EVENTS'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            {tab === 'FEED' ? 'Posts' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'FEED' && (
          <div className="space-y-4">
            {!isMember && <p className="bg-blue-50 text-blue-800 p-4 rounded-lg">Join this community to post.</p>}
            
            {feedData?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.posts.map((post: any) => <PostCard key={post.id} post={post} isCommunityOwner={isOwner} />)}
              </React.Fragment>
            ))}

            {feedData?.pages[0]?.posts.length === 0 && (
              <p className="text-gray-500 text-center py-10">No posts in this community yet.</p>
            )}

            {hasNextPage && (
              <button onClick={() => fetchNextPage()} className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg">Load More</button>
            )}
          </div>
        )}

        {activeTab === 'MEMBERS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {community.members.map((member: any) => (
              <div key={member.userId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={member.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${member.user.name}`} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold">{member.user.name}</p>
                    <p className="text-xs text-gray-500">{member.user.role}</p>
                  </div>
                </div>
                {(isOwner || isAdmin) && member.userId !== community.ownerId && (
                  <button onClick={() => handleKick(member.userId)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition-colors">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'EVENTS' && (
          <div className="text-center py-20 text-gray-500">
            <p>Events feature coming in a future phase!</p>
          </div>
        )}
      </div>
    </div>
  );
};
