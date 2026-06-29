import React, { useState } from 'react';
import { useCreatePost } from '../hooks/usePosts';
import { Send, Image as ImageIcon } from 'lucide-react';

export const CreatePostForm = () => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('GENERAL');
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost.mutate(
      { content, type: postType },
      {
        onSuccess: () => setContent(''),
        onError: (err: any) => alert(err.response?.data?.error || 'Failed to post'),
      }
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full bg-transparent resize-none border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-lg p-2"
          rows={3}
          placeholder="What's happening in your sports world?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-full px-3 py-1.5 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <option value="GENERAL">General</option>
              <option value="LOOKING_FOR_PLAYERS">Looking for Players</option>
              <option value="LOOKING_FOR_TEAM">Looking for Team</option>
              <option value="QUESTION">Question</option>
            </select>
            <button type="button" className="text-gray-500 hover:text-blue-500 transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || createPost.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPost.isPending ? 'Posting...' : 'Post'}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
