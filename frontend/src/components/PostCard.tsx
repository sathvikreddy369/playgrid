import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { useToggleLike, useToggleSave } from '../hooks/usePosts';
import { useAuth } from '../providers/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';

export const PostCard = ({ post }: { post: any }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();

  const [isLiked, setIsLiked] = useState(post.likes?.length > 0);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  
  const [isSaved, setIsSaved] = useState(post.savedBy?.length > 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    toggleLike.mutate({ postId: post.id });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    setIsSaved(!isSaved);
    toggleSave.mutate(post.id);
  };

  return (
    <div 
      onClick={() => navigate(`/posts/${post.id}`)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
    >
      <div className="flex items-start gap-4">
        <img 
          src={post.author.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`} 
          alt={post.author.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{post.author.name}</h3>
            <span className="text-sm text-gray-500 flex-shrink-0">
              • {formatDistanceToNow(new Date(post.createdAt))} ago
              {post.isEdited && ' (edited)'}
            </span>
          </div>
          
          <div className="mt-1 flex items-center gap-2">
             <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
               {post.type.replace(/_/g, ' ')}
             </span>
             {post.location && (
               <span className="text-xs text-gray-500">{post.location}</span>
             )}
          </div>

          <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {post.content}
          </p>

          {post.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-gray-500">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 group transition-colors ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
            >
              <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-blue-600 group transition-colors">
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{post._count?.replies || 0}</span>
            </button>

            <button 
              onClick={handleSave}
              className={`flex items-center gap-1.5 group transition-colors ${isSaved ? 'text-yellow-600' : 'hover:text-yellow-600'}`}
            >
              <Bookmark className={`w-5 h-5 group-hover:scale-110 transition-transform ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button className="flex items-center gap-1.5 hover:text-green-600 group transition-colors">
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
