import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePostDetail, useCreateReply } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { ReplyTree } from '../components/ReplyTree';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: post, isLoading, isError } = usePostDetail(id!);
  const createReply = useCreateReply();

  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createReply.mutate({ postId: post.id, content }, {
      onSuccess: () => setContent('')
    });
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <PostCard post={post} />

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
    </div>
  );
};
