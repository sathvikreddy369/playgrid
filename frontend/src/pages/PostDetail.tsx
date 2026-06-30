import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePostDetail, useCreateReply } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { ReplyTree } from '../components/ReplyTree';
import { Loader2, ArrowLeft, ShieldAlert, AlertTriangle, MapPin } from 'lucide-react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '../providers/AuthProvider';
import { useCreateReport } from '../hooks/useReports';

export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: post, isLoading, isError } = usePostDetail(id!);
  const createReply = useCreateReply();
  const reportMutation = useCreateReport();

  const [content, setContent] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createReply.mutate({ postId: post.id, content }, {
      onSuccess: () => setContent('')
    });
  };

  const handleReport = () => {
    if (!reportReason.trim()) return alert('Please enter a reason');
    reportMutation.mutate(
      { targetType: 'POST', targetId: post.id, reason: reportReason },
      {
        onSuccess: () => {
          alert('Post reported successfully.');
          setShowReportModal(false);
          setReportReason('');
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Failed to report post.');
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Post not found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mt-4">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 relative">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button 
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          <ShieldAlert className="w-4 h-4" />
          Report Post
        </button>
      </div>

      <PostCard post={post} />

      {post.latitude && post.longitude && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-64 relative shadow-sm">
          <Map
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            initialViewState={{
              longitude: post.longitude,
              latitude: post.latitude,
              zoom: 14
            }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
          >
            <Marker longitude={post.longitude} latitude={post.latitude} anchor="bottom">
              <MapPin className="text-red-600 fill-red-100 w-8 h-8 -mt-8" />
            </Marker>
          </Map>
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="mt-6 mb-8 flex items-start gap-3">
          <img 
            src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`} 
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="Post your reply..."
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button 
                type="submit"
                disabled={!content.trim() || createReply.isPending}
                className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createReply.isPending ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center mb-8">
          <p className="text-gray-600 dark:text-gray-300">Sign in to join the conversation.</p>
        </div>
      )}

      <ReplyTree replies={post.replies} postId={post.id} />

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500" /> Report Post</h2>
            <textarea 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-transparent"
              rows={4}
              placeholder="Reason for reporting this post..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium">Cancel</button>
              <button onClick={handleReport} disabled={reportMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50">
                {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
