import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchDetail, useJoinMatch, useMatchAction, useAddMatchComment, useUpdateMatchStatus, useBroadcastMessage, useAddMatchReview, useDeleteMatchComment } from '../hooks/useMatches';
import { useAuth } from '../providers/AuthProvider';
import { ArrowLeft, Calendar, MapPin, Users, IndianRupee, ShieldAlert, Check, Star, MessageSquare, Trash2, Edit3, Send, Clock, ImageIcon, Navigation, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ShareDialog } from '../components/ShareDialog';
import { Skeleton } from '../components/Skeleton';
import { UserLink } from '../components/ui/UserLink';
import { useSocket } from '../hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';
import type { MatchPlayer, MatchComment, MatchReview } from '../types';

export const MatchDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 
 const { data: match, isLoading } = useMatchDetail(id!);
 const joinMatch = useJoinMatch();
 const matchAction = useMatchAction();
 const addComment = useAddMatchComment();
 const deleteComment = useDeleteMatchComment();
 const updateStatus = useUpdateMatchStatus();
 const broadcastMessage = useBroadcastMessage();
 const addReview = useAddMatchReview();
 const socket = useSocket();
 const queryClient = useQueryClient();

 React.useEffect(() => {
   if (socket && id) {
     socket.emit('join_match', { matchId: id });

     const handleUpdate = () => {
       queryClient.invalidateQueries({ queryKey: ['matches', id] });
     };

     socket.on('match_updated', handleUpdate);
     socket.on('participant_joined', handleUpdate);
     socket.on('participant_left', handleUpdate);

     return () => {
       socket.emit('leave_match', { matchId: id });
       socket.off('match_updated', handleUpdate);
       socket.off('participant_joined', handleUpdate);
       socket.off('participant_left', handleUpdate);
     };
   }
 }, [socket, id, queryClient]);

 const [ratings, setRatings] = useState<Record<string, number>>({});
 const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, 'ATTENDED' | 'ABSENT' | 'LATE'>>({});
 const [commentContent, setCommentContent] = useState('');
 const [broadcastContent, setBroadcastContent] = useState('');
 const [reviewRating, setReviewRating] = useState(5);
 const [reviewContent, setReviewContent] = useState('');
 const [isShareOpen, setIsShareOpen] = useState(false);

 if (isLoading) return (
 <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
 <Skeleton className="h-8 w-24 mb-6" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 card-premium p-8"><Skeleton className="h-64 w-full" /></div>
 <div className="card-premium p-6"><Skeleton className="h-96 w-full" /></div>
 </div>
 </div>
 );
 if (!match) return <div className="text-center py-20 font-bold text-muted text-sm">Match not found</div>;

 const isCreator = match.creatorId === user?.id;
 const myRequest = match.players?.find((p: MatchPlayer) => p.userId === user?.id);
 
 const approvedPlayers = match.players?.filter((p: MatchPlayer) => p.status === 'APPROVED' || p.status === 'ATTENDED') || [];
 const pendingPlayers = match.players?.filter((p: MatchPlayer) => p.status === 'PENDING') || [];
 const waitlistedPlayers = match.players?.filter((p: MatchPlayer) => p.status === 'WAITLISTED') || [];

 const handleAction = (userId: string | undefined, action: 'approve' | 'reject' | 'attend' | 'cancel' | 'leave' | 'kick') => {
 const rating = action === 'attend' && userId ? ratings[userId] || 3 : undefined;
 const status = action === 'attend' && userId ? attendanceStatuses[userId] || 'ATTENDED' : undefined;
 if (action === 'attend' && status !== 'ABSENT' && (!rating || rating < 1 || rating > 5)) {
 toast.error("Please provide a valid rating 1-5 before marking attendance.");
 return;
 }
 matchAction.mutate({ matchId: match.id, userId, action, rating, status });
 };

 const isParticipant = isCreator || myRequest?.status === 'APPROVED' || myRequest?.status === 'ATTENDED';

 const handleCommentSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!commentContent.trim()) return;
 addComment.mutate({ matchId: match.id, content: commentContent }, {
 onSuccess: () => setCommentContent('')
 });
 };

 const handleBroadcast = (e: React.FormEvent) => {
 e.preventDefault();
 if (!broadcastContent.trim()) return;
 broadcastMessage.mutate({ matchId: match.id, content: broadcastContent }, {
 onSuccess: () => {
   setBroadcastContent('');
   toast.success('Message sent to all approved players!');
 }
 });
 };

 const handleReviewSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 addReview.mutate({ matchId: match.id, rating: reviewRating, comment: reviewContent }, {
 onSuccess: () => {
   toast.success('Review submitted successfully!');
   setReviewContent('');
 }
 });
 };

 const getSportBadgeClass = (sport: string = '') => {
 const s = sport?.toLowerCase() || '';
 if (s.includes('cricket')) return 'badge-cricket';
 if (s.includes('football') || s.includes('soccer')) return 'badge-football';
 if (s.includes('badminton')) return 'badge-badminton';
 if (s.includes('tennis')) return 'badge-tennis';
 if (s.includes('pickleball')) return 'badge-pickleball';
 if (s.includes('basketball')) return 'badge-basketball';
 return 'bg-zinc-100 text-zinc-700 ';
 };

 return (
 <div className="max-w-5xl mx-auto py-10 px-4">
 <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-foreground mb-8 font-semibold text-sm transition-colors cursor-pointer">
 <ArrowLeft className="w-4 h-4" /> Back to matches
 </button>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Col: Match Info */}
 <div className="lg:col-span-2 space-y-6">
 <div className="card-premium relative overflow-hidden bg-surface">
 {match.status === 'CANCELLED' && (
 <div className="absolute top-0 left-0 w-full bg-red-555 text-white text-center text-[10px] tracking-wider py-1.5 font-extrabold uppercase z-10 shadow-sm">MATCH CANCELLED</div>
 )}
 {match.status === 'FULL' && (
 <div className="absolute top-0 left-0 w-full bg-zinc-950 text-white text-center text-[10px] tracking-wider py-1.5 font-extrabold uppercase z-10 shadow-sm">MATCH FULL</div>
 )}
 {match.status === 'COMPLETED' && (
 <div className="absolute top-0 left-0 w-full bg-emerald-600 text-white text-center text-[10px] tracking-wider py-1.5 font-extrabold uppercase z-10 shadow-sm">MATCH COMPLETED</div>
 )}

 <div className={`p-6 md:p-8 ${match.status !== 'OPEN' ? 'pt-10 md:pt-12' : ''}`}>
 <div className="flex justify-between items-center">
 <span className={`badge-premium ${getSportBadgeClass(match.sport)}`}>{match.sport}</span>
 <button 
   onClick={() => setIsShareOpen(true)}
   className="p-2 text-muted hover:text-foreground bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors border border-border"
   title="Share Match"
 >
   <Share2 className="w-4 h-4" />
 </button>
 </div>

 <h1 className="text-2xl md:text-3xl font-black text-foreground mt-4 mb-3 leading-tight">{match.title}</h1>
 
 {match.community && (
 <div className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-muted bg-zinc-100 px-3 py-1.5 rounded-lg border border-border">
 <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
 Linked Community: <strong className="text-foreground">{match.community.name}</strong>
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-muted bg-zinc-50 p-5 rounded-2xl border border-border">
 <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-zinc-450" /> <span>{match.date ? (isNaN(new Date(match.date).getTime()) ? 'Invalid Date' : format(new Date(match.date), 'PPp')) : 'No Date'}</span></div>
 <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-zinc-450" /> <span className="truncate">{match.venue?.name || match.location || 'No Location'}</span></div>
 <div className="flex items-center gap-3"><Users className="w-4 h-4 text-zinc-450" /> <span>{approvedPlayers.length} / {match.maxPlayers || 0} Players</span></div>
 <div className="flex items-center gap-3"><IndianRupee className="w-4 h-4 text-zinc-450" /> <span>{match.costPerPerson ? `₹${match.costPerPerson} / Person` : 'Free Entry'}</span></div>
 </div>

  {match.venue && (
  <div className="mt-8 border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {match.venue.photos?.[0] ? (
          <img src={match.venue.photos[0]} alt={match.venue.name} className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h3 className="font-bold text-foreground text-lg leading-tight">{match.venue.name}</h3>
          <p className="text-muted text-sm flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" /> {match.venue.location}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {(match.venue.latitude && match.venue.longitude) && (
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${match.venue.latitude},${match.venue.longitude}`} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-4 whitespace-nowrap bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5" /> Directions
          </a>
        )}
        <button onClick={() => navigate(`/venues/${match.venue.id}`)} className="btn-secondary text-xs py-2 px-4 whitespace-nowrap">
          View Venue
        </button>
      </div>
    </div>
  </div>
  )}

 <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <UserLink userId={match.creatorId} className="flex items-center gap-3 hover:opacity-100">
 <img loading="lazy" decoding="async" src={match.creator?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${match.creator?.name || 'User'}&background=random`} alt={match.creator?.name || 'User'} className="w-10 h-10 rounded-full border border-border shadow-sm shrink-0" />
 <div>
 <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Host</p>
 <p className="font-bold text-foreground text-sm hover:underline">{match.creator?.name || 'User'}</p>
 </div>
 </UserLink>

 {!isCreator && ['OPEN', 'FULL'].includes(match.status) && !myRequest && (
 <button onClick={() => joinMatch.mutate(match.id)} disabled={joinMatch.isPending} className="btn-primary">
 {joinMatch.isPending ? 'Requesting...' : match.status === 'FULL' ? 'Join Waitlist' : 'Request to Join'}
 </button>
 )}
 {!isCreator && myRequest && (
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className={`px-5 py-2 rounded-xl text-xs font-bold border ${myRequest.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 ' : myRequest.status === 'WAITLISTED' ? 'bg-purple-50 text-purple-700 border-purple-200 ' : myRequest.status === 'APPROVED' || myRequest.status === 'ATTENDED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ' : 'bg-red-50 text-red-700 border-red-200 '}`}>
 {myRequest.status === 'WAITLISTED' ? 'Waitlisted' : `Request ${myRequest.status}`}
 </div>

 {(myRequest.status === 'PENDING' || myRequest.status === 'WAITLISTED') && (
 <button 
 onClick={() => handleAction(undefined, 'leave')} 
 disabled={matchAction.isPending}
 className="text-xs font-bold text-red-500 hover:underline cursor-pointer disabled:opacity-50"
 >
 Cancel Request
 </button>
 )}

 {myRequest.status === 'APPROVED' && ['OPEN', 'FULL', 'ONGOING'].includes(match.status) && (
 <button 
 onClick={() => {
 if(window.confirm('Are you sure you want to leave this match?')) {
 handleAction(undefined, 'leave');
 }
 }} 
 disabled={matchAction.isPending}
 className="text-xs font-bold text-red-500 hover:underline cursor-pointer disabled:opacity-50"
 >
 Leave Match
 </button>
 )}
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Host Dashboard */}
 {isCreator && ['OPEN', 'FULL', 'ONGOING'].includes(match.status) && (
 <div className="card-premium p-6 bg-zinc-950 text-white rounded-2xl">
   <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Edit3 className="w-5 h-5 text-emerald-400" /> Host Dashboard</h3>
   
   <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-zinc-800">
     <button 
      onClick={() => updateStatus.mutate({ matchId: match.id, status: 'ONGOING' })}
      disabled={match.status === 'ONGOING' || updateStatus.isPending}
      className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer text-center"
     >
       Mark Ongoing
     </button>
     <button 
      onClick={() => updateStatus.mutate({ matchId: match.id, status: 'COMPLETED' })}
      disabled={match.status === 'COMPLETED' || updateStatus.isPending}
      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer text-center"
     >
       Mark Completed
     </button>
     <button onClick={() => handleAction(undefined, 'cancel')} className="flex-1 border border-red-500/50 hover:bg-red-500/20 text-red-400 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer text-center">
       Cancel Match
     </button>
   </div>

   <form onSubmit={handleBroadcast} className="flex gap-2">
     <input
       type="text"
       value={broadcastContent}
       onChange={(e) => setBroadcastContent(e.target.value)}
       placeholder="Broadcast message to all players..."
       className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
     />
     <button disabled={broadcastMessage.isPending || !broadcastContent} type="submit" className="bg-primary-500 hover:bg-primary-400 text-white px-4 rounded-lg flex items-center justify-center">
       <Send className="w-4 h-4" />
     </button>
   </form>
 </div>
 )}

 {/* Reviews Section */}
 {match.status === 'COMPLETED' && (
 <div className="card-premium p-6 md:p-8 bg-surface">
   <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Reviews</h3>
   {match.reviews?.length > 0 ? (
     <div className="space-y-4">
       {match.reviews.map((r: MatchReview) => (
         <div key={r.id} className="bg-zinc-50 p-4 rounded-xl border border-border">
           <div className="flex justify-between items-start mb-2">
             <UserLink userId={r.userId} className="font-bold text-sm hover:underline">{r.user?.name}</UserLink>
             <div className="flex text-amber-500 text-xs">
               {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
             </div>
           </div>
           {r.comment && <p className="text-sm text-muted">{r.comment}</p>}
         </div>
       ))}
     </div>
   ) : (
     <p className="text-xs text-muted font-semibold bg-zinc-50 p-4 rounded-xl text-center">No reviews yet.</p>
   )}

   {myRequest?.status === 'ATTENDED' && !match.reviews?.find((r: MatchReview) => r.userId === user?.id) && (
     <form onSubmit={handleReviewSubmit} className="mt-6 pt-6 border-t border-border">
       <h4 className="font-bold text-sm mb-3 text-zinc-950">Leave a Review</h4>
       <div className="mb-3">
         <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="text-sm border border-border rounded-lg px-3 py-2 bg-white font-semibold">
           {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
         </select>
       </div>
       <textarea
         value={reviewContent}
         onChange={e => setReviewContent(e.target.value)}
         placeholder="How was the match?"
         className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none mb-3 resize-none h-24"
       />
       <button disabled={addReview.isPending} type="submit" className="btn-primary">Submit Review</button>
     </form>
   )}
 </div>
 )}

 {/* Discussion */}
 <div className="card-premium p-6 md:p-8 bg-surface">
 <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-muted" /> Discussion</h3>
 <div className="space-y-4 mb-6">
 {match.comments?.length > 0 ? (
 match.comments.map((comment: MatchComment) => (
 <div key={comment.id} className="flex gap-3">
 <UserLink userId={comment.userId}>
 <img loading="lazy" decoding="async" src={comment.user?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}&background=random`} alt={comment.user?.name || 'User'} className="w-8 h-8 rounded-full shrink-0" />
 </UserLink>
 <div className="flex-1">
 <div className="bg-zinc-50 border border-border rounded-2xl rounded-tl-none px-4 py-3 relative group">
 <UserLink userId={comment.userId}>
 <p className="text-[12px] font-extrabold text-foreground mb-1 hover:underline">{comment.user?.name || 'User'}</p>
 </UserLink>
 <p className="text-sm text-muted leading-relaxed">{comment.content}</p>
 {(comment.userId === user?.id || isCreator) && (
   <button 
    onClick={() => {
      if(window.confirm('Delete comment?')) deleteComment.mutate({ matchId: match.id, commentId: comment.id });
    }}
    className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
   >
     <Trash2 className="w-3.5 h-3.5" />
   </button>
 )}
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-border">
 <p className="text-xs text-muted font-semibold">No comments yet. Start the discussion!</p>
 </div>
 )}
 </div>

 {isParticipant ? (
 <form onSubmit={handleCommentSubmit} className="flex gap-3">
 <input
 type="text"
 value={commentContent}
 onChange={(e) => setCommentContent(e.target.value)}
 placeholder="Say something..."
 className="flex-1 px-4 py-2.5 border border-border rounded-xl bg-surface text-sm text-foreground focus:ring-2 focus:ring-zinc-950 focus:outline-none"
 disabled={addComment.isPending}
 />
 <button
 type="submit"
 disabled={addComment.isPending || !commentContent.trim()}
 className="btn-primary px-6"
 >
 {addComment.isPending ? 'Posting...' : 'Post'}
 </button>
 </form>
 ) : (
 <p className="text-xs font-semibold text-muted bg-zinc-100 p-3.5 rounded-xl text-center border border-border">Only approved players can comment on this match.</p>
 )}
 </div>
 </div>

 {/* Right Col: Roster */}
 <div className="space-y-6">
 <div className="card-premium p-6 bg-surface">
 <h3 className="font-bold text-base mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-muted" /> Roster ({approvedPlayers.length})</h3>
 {approvedPlayers.length === 0 ? (
 <p className="text-xs text-muted font-semibold text-center py-6 bg-zinc-50 rounded-2xl border border-dashed border-border">No players confirmed yet.</p>
 ) : (
 <div className="space-y-4">
 {approvedPlayers.map((p: MatchPlayer) => (
 <div key={p.userId} className="flex flex-col gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <UserLink userId={p.userId}>
 <img loading="lazy" decoding="async" src={p.user?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${p.user?.name || 'User'}&background=random`} alt={p.user?.name || 'User'} className="w-8 h-8 rounded-full bg-border" />
 </UserLink>
 <div>
 <p className="font-bold text-foreground text-sm flex items-center gap-1">
 <UserLink userId={p.userId} className="hover:underline">
 <span>{p.user?.name || 'User'}</span>
 </UserLink>
 {p.userId === match.creatorId && <span className="text-[9px] bg-zinc-100 border border-border px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider text-foreground">Host</span>}
 </p>
 <p className="text-[10px] text-muted font-bold flex items-center gap-1">
  <ShieldAlert className="w-3 h-3" /> Trust Score: {p.user?.trust ? `${p.user.trust.trustCategory} · ${Math.round(p.user.trust.internalTrustScore / 10)}/100` : 'N/A'}
 </p>
 </div>
 </div>
 </div>

 {isCreator && ['ONGOING', 'COMPLETED'].includes(match.status) && p.userId !== match.creatorId && p.status === 'APPROVED' && (
 <div className="flex items-center gap-2 mt-1">
  <select 
  className="flex-1 text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-foreground font-semibold outline-none focus:ring-1 focus:ring-zinc-950"
  value={attendanceStatuses[p.userId] || 'ATTENDED'}
  onChange={(e) => setAttendanceStatuses(prev => ({...prev, [p.userId]: e.target.value as any}))}
  >
  <option value="ATTENDED">Attended</option>
  <option value="LATE">Late</option>
  <option value="ABSENT">Absent</option>
  </select>

  {attendanceStatuses[p.userId] !== 'ABSENT' && (
  <select 
  className="flex-1 text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-foreground font-semibold outline-none focus:ring-1 focus:ring-zinc-950"
  value={ratings[p.userId] || 3}
  onChange={(e) => setRatings(prev => ({...prev, [p.userId]: parseInt(e.target.value)}))}
  >
  <option value={1}>1 - Poor</option>
  <option value={2}>2 - Below Avg</option>
  <option value={3}>3 - Average</option>
  <option value={4}>4 - Good</option>
  <option value={5}>5 - Excellent</option>
  </select>
  )}
 <button onClick={() => handleAction(p.userId, 'attend')} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer">
 Confirm
 </button>
 </div>
 )}
 
 {isCreator && ['OPEN', 'FULL'].includes(match.status) && p.userId !== match.creatorId && p.status === 'APPROVED' && (
 <button 
 onClick={() => {
 if (window.confirm(`Kick ${p.user?.name} from the match?`)) {
 handleAction(p.userId, 'kick');
 }
 }}
 className="text-[10px] text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg font-bold self-start mt-1 cursor-pointer transition-colors"
 >
 Kick Player
 </button>
 )}

 {['ATTENDED', 'LATE', 'ABSENT'].includes(p.status) && (
 <div className={`text-[10px] border px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 self-start mt-1 ${
   p.status === 'ATTENDED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
   p.status === 'LATE' ? 'bg-amber-50 border-amber-200 text-amber-700' :
   'bg-red-50 border-red-200 text-red-700'
 }`}>
 <Check className="w-3.5 h-3.5" /> {p.status} {p.status !== 'ABSENT' && p.performanceRating && `(${p.performanceRating} `}
 {p.status !== 'ABSENT' && p.performanceRating && <Star className="w-3 h-3 inline fill-current"/>}
 {p.status !== 'ABSENT' && p.performanceRating && ')'}
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {isCreator && pendingPlayers.length > 0 && (
 <div className="card-premium p-6 bg-surface border-amber-200">
 <h3 className="font-bold text-base mb-4 text-zinc-950 flex items-center gap-1.5">Pending Requests ({pendingPlayers.length})</h3>
 <div className="space-y-3">
 {pendingPlayers.map((p: MatchPlayer) => (
 <div key={p.userId} className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-2xl border border-border">
 <div className="flex items-center gap-2.5">
 <UserLink userId={p.userId}>
 <img loading="lazy" decoding="async" src={p.user?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${p.user?.name || 'User'}&background=random`} alt={p.user?.name || 'User'} className="w-8 h-8 rounded-full bg-border" />
 </UserLink>
 <div>
 <UserLink userId={p.userId} className="hover:underline">
 <span className="font-bold text-foreground text-xs block">{p.user?.name || 'User'}</span>
 </UserLink>
 <span className="text-[10px] text-muted font-bold flex items-center gap-1">
   <ShieldAlert className="w-3 h-3" /> Trust Score: {p.user?.trust ? `${p.user.trust.trustCategory} · ${Math.round(p.user.trust.internalTrustScore / 10)}/100` : 'N/A'}
 </span>
 </div>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleAction(p.userId, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">Approve</button>
 <button onClick={() => handleAction(p.userId, 'reject')} className="flex-1 bg-surface border border-border hover:bg-red-50 hover:text-red-600 text-foreground text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer">Reject</button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {isCreator && waitlistedPlayers.length > 0 && (
 <div className="card-premium p-6 bg-surface border-purple-200">
 <h3 className="font-bold text-base mb-4 text-zinc-950 flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-500" /> Waitlist ({waitlistedPlayers.length})</h3>
 <div className="space-y-3">
 {waitlistedPlayers.map((p: MatchPlayer) => (
 <div key={p.userId} className="flex flex-col gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
 <div className="flex items-center gap-2.5">
 <UserLink userId={p.userId}>
 <img loading="lazy" decoding="async" src={p.user?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${p.user?.name || 'User'}&background=random`} alt={p.user?.name || 'User'} className="w-8 h-8 rounded-full bg-border" />
 </UserLink>
 <div>
 <UserLink userId={p.userId} className="hover:underline">
 <span className="font-bold text-foreground text-xs block">{p.user?.name || 'User'}</span>
 </UserLink>
 <span className="text-[10px] text-muted font-bold flex items-center gap-1">
   <ShieldAlert className="w-3 h-3" /> Trust Score: {p.user?.trust ? `${p.user.trust.trustCategory} · ${Math.round(p.user.trust.internalTrustScore / 10)}/100` : 'N/A'}
 </span>
 </div>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleAction(p.userId, 'approve')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">Promote</button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 </div>
   </div>
   <ShareDialog 
     isOpen={isShareOpen} 
     onClose={() => setIsShareOpen(false)} 
     title={match?.title || 'Check out this match on PlayGrid'}
     url={window.location.href}
   />
 </div>
 );
};
