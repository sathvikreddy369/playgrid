import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Bookmark, Share2, Trash2, Navigation, MoreHorizontal } from 'lucide-react';
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
        // Silently ignore abort errors if user cancels share sheet
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="card p-5 mb-5 cursor-pointer"
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <div className="flex items-start gap-4">
        <img 
          src={post.author.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`} 
          alt={post.author.name}
          loading="lazy"
          decoding="async"
          className="w-11 h-11 rounded-full object-cover shrink-0 bg-border"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-2 overflow-hidden flex-wrap leading-tight">
              <h3 
                className="font-semibold text-foreground truncate hover:underline cursor-pointer" 
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.authorId || post.author.id}`); }}
              >
                {post.author.name}
              </h3>
              
              <span className="text-[13px] text-muted">
                {formatDistanceToNow(new Date(post.createdAt))} ago
                {post.isEdited && ' • edited'}
              </span>
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
                className="p-1.5 text-muted hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {(post.community || post.type || post.location) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {post.community && (
                <span 
                  className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md hover:bg-primary-100 transition-colors cursor-pointer" 
                  onClick={(e) => { e.stopPropagation(); navigate(`/communities/${post.community.id}`); }}
                >
                  {post.community.name}
                </span>
              )}
              {post.type && post.type !== 'GENERAL' && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-surface border border-border text-foreground rounded-md">
                  {post.type.replace(/_/g, ' ')}
                </span>
              )}
              {post.location && (
                <span className="text-xs text-muted font-medium ml-1">
                  in {post.location}
                </span>
              )}
              {distanceStr && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  • {distanceStr}
                </span>
              )}
            </div>
          )}

          <p className="text-foreground whitespace-pre-wrap leading-relaxed text-[15px]">
            {post.content}
          </p>

          {post.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[13px] text-muted hover:text-primary-500 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-muted max-w-sm">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 group transition-colors active:scale-95 ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
                <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
              </div>
              <span className="text-[13px] font-medium">{likesCount > 0 ? likesCount : ''}</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-primary-500 group transition-colors active:scale-95">
              <div className="p-1.5 rounded-full group-hover:bg-primary-500/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-medium">{post._count?.replies > 0 ? post._count.replies : ''}</span>
            </button>

            <button 
              onClick={handleSave}
              className={`flex items-center gap-1.5 group transition-colors active:scale-95 ${isSaved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isSaved ? 'bg-yellow-500/10' : 'group-hover:bg-yellow-500/10'}`}>
                <Bookmark className={`w-4 h-4 transition-transform ${isSaved ? 'fill-current scale-110' : ''}`} />
              </div>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-green-500 group transition-colors active:scale-95">
              <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </div>
            </button>
            
            {post.latitude && post.longitude && (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-muted hover:text-foreground group transition-colors active:scale-95"
              >
                <div className="p-1.5 rounded-full group-hover:bg-border transition-colors">
                  <Navigation className="w-4 h-4" />
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
