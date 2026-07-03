import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Bookmark, Share2, Trash2, Navigation } from 'lucide-react';
import { useToggleLike, useToggleSave, useDeletePost } from '../hooks/usePosts';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { UserLink } from './ui/UserLink';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
 var R = 6371; // Radius of the earth in km
 var dLat = deg2rad(lat2-lat1); 
 var dLon = deg2rad(lon2-lon1); 
 var a = 
 Math.sin(dLat/2) * Math.sin(dLat/2) +
 Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(deg2rad(lat2))) * 
 Math.sin(dLon/2) * Math.sin(dLon/2)
 ; 
 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
 var d = R * c; 
 return d;
}

function deg2rad(deg: number) {
 return deg * (Math.PI/180)
}

function getPostTypeBadgeVariant(type: string): "default" | "success" | "warning" | "danger" | "info" | "cricket" | "football" | "basketball" | "badminton" | "tennis" | "pickleball" {
  switch (type) {
    case 'LOOKING_FOR_PLAYERS': return 'info';
    case 'LOOKING_FOR_TEAM': return 'success';
    case 'TOURNAMENT_ANNOUNCEMENT': return 'warning';
    case 'QUESTION': return 'danger';
    case 'GROUND_PROMOTION': return 'cricket';
    case 'EQUIPMENT': return 'badminton';
    case 'TRAINING': return 'football';
    case 'COMMUNITY_POST': return 'default';
    default: return 'default';
  }
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
 } catch {
 // Silently ignore
 }
 } else {
 navigator.clipboard.writeText(url);
 toast.success('Link copied to clipboard!');
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
 className="mb-5"
 >
 <Card 
 className="p-5 cursor-pointer hover:border-primary-300 transition-colors"
 onClick={() => navigate(`/posts/${post.id}`)}
 >
 <div className="flex items-start gap-4">
 <UserLink userId={post.authorId || post.author.id} onClick={(e) => e.stopPropagation()}>
   <Avatar 
     src={post.author.profile?.avatarUrl || undefined} 
     fallback={post.author.name} 
     size="md"
   />
 </UserLink>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-1.5">
 <div className="flex items-baseline gap-2 overflow-hidden flex-wrap leading-none">
 <UserLink userId={post.authorId || post.author.id} onClick={(e) => e.stopPropagation()}>
   <h3 className="font-bold text-foreground text-[15px] truncate hover:text-primary-600 transition-colors cursor-pointer">
     {post.author.name}
   </h3>
 </UserLink>
 
 <span className="text-[12px] font-semibold text-muted">
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
 className="p-2 text-muted hover:text-red-500 rounded-full hover:bg-red-50 transition-colors ml-2 shrink-0 cursor-pointer"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 )}
 </div>

 {(post.community || post.type || post.location) && (
 <div className="flex flex-wrap items-center gap-1.5 mb-3">
 {post.community && (
 <Badge 
 variant="info"
 className="cursor-pointer hover:opacity-80 transition-opacity" 
 onClick={(e) => { e.stopPropagation(); navigate(`/communities/${post.community.id}`); }}
 >
 {post.community.name}
 </Badge>
 )}
 {post.type && post.type !== 'GENERAL' && (
 <Badge variant={getPostTypeBadgeVariant(post.type)}>
 {post.type.replace(/_/g, ' ')}
 </Badge>
 )}
 {post.location && (
 <span className="text-xs text-muted font-bold ml-1">
 in {post.location}
 </span>
 )}
 {distanceStr && (
 <span className="text-xs text-primary-600 font-bold ml-1">
 • {distanceStr}
 </span>
 )}
 </div>
 )}

 <p className="text-foreground whitespace-pre-wrap leading-relaxed text-[15px] mt-1">
 {post.content}
 </p>

 {post.tags?.length > 0 && (
 <div className="mt-4 flex flex-wrap gap-2">
 {post.tags.map((tag: string) => (
 <span key={tag} className="text-sm font-bold text-primary-600/80 hover:text-primary-600 transition-colors cursor-pointer">
 #{tag}
 </span>
 ))}
 </div>
 )}

 <div className="mt-6 flex items-center justify-between text-muted max-w-sm">
 <button 
 onClick={handleLike}
 className={`flex items-center gap-2 group transition-colors active:scale-95 cursor-pointer ${isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
 >
 <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-rose-500/10' : 'group-hover:bg-rose-500/10'}`}>
 <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current scale-110' : 'stroke-[2px]'}`} />
 </div>
 <span className="text-sm font-bold">{likesCount > 0 ? likesCount : ''}</span>
 </button>

 <button className="flex items-center gap-2 hover:text-foreground group transition-colors active:scale-95 cursor-pointer">
 <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
 <MessageCircle className="w-5 h-5 stroke-[2px]" />
 </div>
 <span className="text-sm font-bold">{post._count?.replies > 0 ? post._count.replies : ''}</span>
 </button>

 <button 
 onClick={handleSave}
 className={`flex items-center gap-2 group transition-colors active:scale-95 cursor-pointer ${isSaved ? 'text-amber-500' : 'hover:text-amber-500'}`}
 >
 <div className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-amber-500/10' : 'group-hover:bg-amber-500/10'}`}>
 <Bookmark className={`w-5 h-5 transition-transform ${isSaved ? 'fill-current scale-110' : 'stroke-[2px]'}`} />
 </div>
 </button>

 <button onClick={handleShare} className="flex items-center gap-2 hover:text-foreground group transition-colors active:scale-95 cursor-pointer">
 <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
 <Share2 className="w-5 h-5 stroke-[2px]" />
 </div>
 </button>
 
 {post.latitude && post.longitude && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 e.preventDefault();
 window.open(`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`, '_blank');
 }}
 className="flex items-center gap-2 text-muted hover:text-foreground group transition-colors active:scale-95 cursor-pointer"
 title="Directions"
 >
 <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
 <Navigation className="w-5 h-5 stroke-[2px]" />
 </div>
 </button>
 )}
 </div>
 </div>
 </div>
 </Card>
 </motion.div>
 );
};
