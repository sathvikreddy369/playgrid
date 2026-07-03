import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useCreateReport } from '../hooks/useReports';
import { useAuth } from '../providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, MessageSquare } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { StatsGrid } from '../components/StatsGrid';
import { BadgeGrid } from '../components/BadgeGrid';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { Link } from 'react-router-dom';

export const UserPublicProfile = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { user: currentUser } = useAuth();
 const [reportReason, setReportReason] = useState('');
 const [showReportModal, setShowReportModal] = useState(false);
 const [activeTab, setActiveTab] = useState<'activity' | 'communities' | 'matches'>('activity');

 const reportMutation = useCreateReport();

 const { data: user, isLoading } = useQuery({
 queryKey: ['user', id],
 queryFn: async () => {
 // Need a backend endpoint for this or just fetch from search?
 // For now let's assume we can fetch basic user info if we add an endpoint
 const { data } = await api.get(`/users/${id}`);
 return data;
 },
 enabled: !!id
 });

 const handleReport = () => {
 if (!reportReason.trim()) return toast.error('Please enter a reason');
 reportMutation.mutate(
 { targetType: 'USER', targetId: id!, reason: reportReason },
 {
 onSuccess: () => {
 toast.success('User reported successfully.');
 setShowReportModal(false);
 setReportReason('');
 },
 onError: (err: any) => {
 toast.error(err.response?.data?.error || 'Failed to report user.');
 }
 }
 );
 };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
  if (!user) return <div className="p-8 text-center text-muted font-bold text-sm">User not found</div>;

  const profile = user.profile || {};
  
  return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto p-6">
  <div className="card-premium bg-surface p-6 space-y-6 relative">
  
  <button 
  onClick={() => setShowReportModal(true)}
  className="absolute top-6 right-6 p-2 text-muted hover:text-red-600 transition-colors bg-zinc-50 rounded-full"
  title="Report User"
  >
  <ShieldAlert className="w-5 h-5" />
  </button>

  <div className="flex items-center gap-4">
  <img src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="avatar" className="w-20 h-20 rounded-full border-4 border-surface shadow-sm" />
  <div>
  <h1 className="text-2xl font-black text-foreground">{user.name}</h1>
  <p className="text-muted font-bold text-xs uppercase tracking-wider">{user.role}</p>
  <p className="text-sm font-bold text-emerald-600 mt-1 mb-3">Reputation: {user.reputation}</p>
  {currentUser && currentUser.id !== id && (
   <button 
     onClick={() => navigate(`/messages?userId=${id}`)} 
     className="btn-primary py-2 text-xs flex items-center gap-2"
   >
     <MessageSquare className="w-4 h-4" /> Message
   </button>
  )}
  </div>
 </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border ">
  <div className="bg-zinc-50 p-4 rounded-xl border border-border">
  <h3 className="font-bold text-sm mb-2 text-foreground">About</h3>
  <p className="text-muted text-xs font-semibold leading-relaxed">{profile.bio || 'No bio provided.'}</p>
  </div>
  <div className="bg-zinc-50 p-4 rounded-xl border border-border">
  <h3 className="font-bold text-sm mb-2 text-foreground">Details</h3>
  <p className="text-muted text-xs font-semibold mb-1">📍 {profile.location || 'Unknown location'}</p>
  <p className="text-muted text-xs font-semibold">🎮 {profile.favoriteGames?.join(', ') || 'No games listed'}</p>
  </div>
  </div>
  
  <StatsGrid user={user} />
  <BadgeGrid badges={user.badges} />

  <div className="mt-8">
    <div className="flex gap-6 border-b border-border overflow-x-auto no-scrollbar">
      {[
        { id: 'activity', label: 'Activity' },
        { id: 'matches', label: 'Matches' },
        { id: 'communities', label: 'Communities' }
      ].map((tab) => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`pb-4 text-sm font-bold transition-colors whitespace-nowrap relative cursor-pointer ${activeTab === tab.id ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div layoutId="public-profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
          )}
        </button>
      ))}
    </div>

    <div className="mt-6 min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeTab === 'activity' && <ActivityTimeline userId={user.id} />}
          
          {activeTab === 'communities' && (
            <div className="grid grid-cols-1 gap-4">
              {user.communityMemberships?.length > 0 ? user.communityMemberships.map((m: any) => (
                <Link key={m.id} to={`/communities/${m.communityId}`} className="card-premium p-4 flex items-center gap-3 bg-surface hover:border-zinc-400 transition-colors">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0 border border-border">
                     <ShieldAlert className="text-zinc-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{m.community?.name}</h4>
                    <p className="text-[10px] uppercase font-bold text-muted">Member</p>
                  </div>
                </Link>
              )) : <div className="text-center py-10 text-muted font-bold text-sm">No communities joined.</div>}
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="text-center py-10 text-muted font-bold text-sm">Match history is available in the Matches tab.</div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  </div>

 </div>

  {showReportModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-border shadow-xl">
  <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-foreground"><AlertTriangle className="text-red-500 w-5 h-5" /> Report User</h2>
  <textarea 
  className="w-full p-3 border border-border bg-zinc-50 text-foreground text-sm font-medium rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all resize-none"
  rows={4}
  placeholder="Reason for reporting this user..."
  value={reportReason}
  onChange={e => setReportReason(e.target.value)}
  />
  <div className="flex justify-end gap-3">
  <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-muted hover:text-foreground bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-xl font-bold text-xs">Cancel</button>
  <button onClick={handleReport} disabled={reportMutation.isPending} className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-xl font-bold text-xs disabled:opacity-50">
  {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
  </button>
  </div>
  </div>
  </div>
  )}
 </motion.div>
 );
};
