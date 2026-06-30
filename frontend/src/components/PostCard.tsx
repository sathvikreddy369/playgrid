import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Bookmark, Share2, Trash2, Navigation } from 'lucide-react';
import { useToggleLike, useToggleSave, useDeletePost } from '../hooks/usePosts';
import { useAuth } from '../providers/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export const PostCard = ({ post, isCommunityOwner = false }: { post: any, isCommunityOwner?: boolean }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const deletePost = useDeletePost();

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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author.name} on Playgrid`,
          text: post.content.substring(0, 100) + '...',
          url: url,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  let distanceStr = null;
  if (profile?.homeLatitude && profile?.homeLongitude && post.latitude && post.longitude) {
    const d = getDistanceFromLatLonInKm(profile.homeLatitude, profile.homeLongitude, post.latitude, post.longitude);
    distanceStr = d < 1 ? 'Less than 1 km away' : `${Math.round(d)} km away`;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <div className="flex items-start gap-4">
        <img 
          src={post.author.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`} 
          alt={post.author.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-50 dark:ring-gray-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.authorId || post.author.id}`); }}>{post.author.name}</h3>
              {post.community && (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md" onClick={(e) => { e.stopPropagation(); navigate(`/communities/${post.community.id}`); }}>
                  in {post.community.name}
                </span>
              )}
              <span className="text-sm text-gray-400 flex-shrink-0">
                • {formatDistanceToNow(new Date(post.createdAt))} ago
                {post.isEdited && ' (edited)'}
              </span>
            </div>
          </div>
          
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
             <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
               {post.type.replace(/_/g, ' ')}
             </span>
             {post.location && (
               <span className="text-xs text-gray-500 font-medium">{post.location}</span>
             )}
             {distanceStr && (
               <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">{distanceStr}</span>
             )}
          </div>

          <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {post.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between text-gray-500 pt-3 border-t border-gray-50 dark:border-gray-700/50">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1.5 group transition-colors ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isLiked ? 'bg-pink-50 dark:bg-pink-900/20' : 'group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20'}`}>
                  <Heart className={`w-[18px] h-[18px] transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
                </div>
                <span className="text-sm font-medium">{likesCount}</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-blue-600 group transition-colors">
                <div className="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <MessageCircle className="w-[18px] h-[18px]" />
                </div>
                <span className="text-sm font-medium">{post._count?.replies || 0}</span>
              </button>

              <button 
                onClick={handleSave}
                className={`flex items-center gap-1.5 group transition-colors ${isSaved ? 'text-yellow-600' : 'hover:text-yellow-600'}`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isSaved ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20'}`}>
                  <Bookmark className={`w-[18px] h-[18px] transition-transform ${isSaved ? 'fill-current scale-110' : ''}`} />
                </div>
              </button>

              <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-green-600 group transition-colors">
                <div className="p-1.5 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                  <Share2 className="w-[18px] h-[18px]" />
                </div>
              </button>
              
              {post.latitude && post.longitude && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 hover:text-blue-600 group transition-colors text-xs font-medium bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Directions
                </a>
              )}
            </div>
            
            {(user?.id === post.authorId || user?.role === 'ADMIN' || isCommunityOwner) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this post?')) {
                    deletePost.mutate(post.id);
                  }
                }}
                disabled={deletePost.isPending}
                className="flex items-center gap-1.5 hover:text-red-600 group transition-colors"
              >
                <div className="p-1.5 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-[18px] h-[18px]" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
