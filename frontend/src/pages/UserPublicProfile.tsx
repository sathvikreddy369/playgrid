import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useCreateReport } from '../hooks/useReports';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

export const UserPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

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
    if (!reportReason.trim()) return alert('Please enter a reason');
    reportMutation.mutate(
      { targetType: 'USER', targetId: id!, reason: reportReason },
      {
        onSuccess: () => {
          alert('User reported successfully.');
          setShowReportModal(false);
          setReportReason('');
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Failed to report user.');
        }
      }
    );
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  const profile = user.profile || {};
  const badges = user.badges || [];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6 relative">
        
        <button 
          onClick={() => setShowReportModal(true)}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-full"
          title="Report User"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <img src={profile.avatarUrl || 'https://via.placeholder.com/100'} alt="avatar" className="w-20 h-20 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.role}</p>
            <p className="text-sm font-semibold text-green-600 mt-1">Reputation: {user.reputation}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-lg mb-2">About</h3>
            <p className="text-gray-700 dark:text-gray-300">{profile.bio || 'No bio provided.'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <p className="text-gray-700 dark:text-gray-300">📍 {profile.location || 'Unknown location'}</p>
            <p className="text-gray-700 dark:text-gray-300 mt-1">🎮 {profile.favoriteGames?.join(', ') || 'No games listed'}</p>
          </div>
        </div>

      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500" /> Report User</h2>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={4}
              placeholder="Reason for reporting this user..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button onClick={handleReport} disabled={reportMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50">
                {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
