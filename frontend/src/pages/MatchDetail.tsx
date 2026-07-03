import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchDetail, useJoinMatch, useMatchAction, useAddMatchComment } from '../hooks/useMatches';
import { useAuth } from '../providers/AuthProvider';
import { ArrowLeft, Calendar, MapPin, Users, IndianRupee, ShieldAlert, Check, Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/Skeleton';
import { UserLink } from '../components/ui/UserLink';
import type { MatchPlayer, MatchComment } from '../types';

export const MatchDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 
 const { data: match, isLoading } = useMatchDetail(id!);
 const joinMatch = useJoinMatch();
 const matchAction = useMatchAction();
 const addComment = useAddMatchComment();

 const [ratings, setRatings] = useState<Record<string, number>>({});
 const [commentContent, setCommentContent] = useState('');

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

 const handleAction = (userId: string | undefined, action: 'approve' | 'reject' | 'attend' | 'cancel' | 'leave' | 'kick') => {
 const rating = action === 'attend' && userId ? ratings[userId] || 3 : undefined;
 if (action === 'attend' && (!rating || rating < 1 || rating > 5)) {
 toast.error("Please provide a valid rating 1-5 before marking attendance.");
 return;
 }
 matchAction.mutate({ matchId: match.id, userId, action, rating });
 };

 const isPast = new Date(match.date) < new Date();
 const isParticipant = isCreator || myRequest?.status === 'APPROVED' || myRequest?.status === 'ATTENDED';

 const handleCommentSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!commentContent.trim()) return;
 addComment.mutate({ matchId: match.id, content: commentContent }, {
 onSuccess: () => setCommentContent('')
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

 <div className={`p-6 md:p-8 ${match.status !== 'OPEN' ? 'pt-10 md:pt-12' : ''}`}>
 <div className="flex justify-between items-center">
 <span className={`badge-premium ${getSportBadgeClass(match.sport)}`}>{match.sport}</span>
 {isCreator && match.status !== 'CANCELLED' && (
 <button onClick={() => handleAction(undefined, 'cancel')} className="text-red-500 text-xs font-bold hover:underline cursor-pointer">
 Cancel Match
 </button>
 )}
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
 <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-zinc-450" /> <span className="truncate">{match.location || 'No Location'}</span></div>
 <div className="flex items-center gap-3"><Users className="w-4 h-4 text-zinc-450" /> <span>{approvedPlayers.length} / {match.maxPlayers || 0} Players</span></div>
 <div className="flex items-center gap-3"><IndianRupee className="w-4 h-4 text-zinc-450" /> <span>{match.costPerPerson ? `₹${match.costPerPerson} / Person` : 'Free Entry'}</span></div>
 </div>

 <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <UserLink userId={match.creatorId} className="flex items-center gap-3 hover:opacity-100">
 <img loading="lazy" decoding="async" src={match.creator?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${match.creator?.name || 'User'}&background=random`} alt={match.creator?.name || 'User'} className="w-10 h-10 rounded-full border border-border shadow-sm shrink-0" />
 <div>
 <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Host</p>
 <p className="font-bold text-foreground text-sm hover:underline">{match.creator?.name || 'User'}</p>
 </div>
 </UserLink>

 {!isCreator && match.status === 'OPEN' && !myRequest && (
 <button onClick={() => joinMatch.mutate(match.id)} disabled={joinMatch.isPending} className="btn-primary">
 {joinMatch.isPending ? 'Requesting...' : 'Request to Join'}
 </button>
 )}
 {!isCreator && myRequest && (
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className={`px-5 py-2 rounded-xl text-xs font-bold border ${myRequest.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 ' : myRequest.status === 'APPROVED' || myRequest.status === 'ATTENDED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ' : 'bg-red-50 text-red-700 border-red-200 '}`}>
 Request {myRequest.status}
 </div>

 {myRequest.status === 'PENDING' && (
 <button 
 onClick={() => handleAction(undefined, 'leave')} 
 disabled={matchAction.isPending}
 className="text-xs font-bold text-red-500 hover:underline cursor-pointer disabled:opacity-50"
 >
 Withdraw Request
 </button>
 )}

 {myRequest.status === 'APPROVED' && !isPast && (
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
 <div className="bg-zinc-50 border border-border rounded-2xl rounded-tl-none px-4 py-3">
 <UserLink userId={comment.userId}>
 <p className="text-[12px] font-extrabold text-foreground mb-1 hover:underline">{comment.user?.name || 'User'}</p>
 </UserLink>
 <p className="text-sm text-muted leading-relaxed">{comment.content}</p>
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
 <p className="text-[10px] text-muted font-bold">Reputation: {p.user?.reputation ?? 0}</p>
 </div>
 </div>
 </div>

 {isCreator && isPast && p.userId !== match.creatorId && p.status === 'APPROVED' && (
 <div className="flex items-center gap-2 mt-1">
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
 <button onClick={() => handleAction(p.userId, 'attend')} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer">
 Confirm
 </button>
 </div>
 )}
 
 {isCreator && !isPast && p.userId !== match.creatorId && p.status === 'APPROVED' && (
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

 {p.status === 'ATTENDED' && (
 <div className="text-[10px] bg-zinc-50 border border-border text-muted px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 self-start mt-1">
 <Check className="w-3.5 h-3.5 text-emerald-500" /> Attended ({p.performanceRating} <Star className="w-3 h-3 inline fill-current text-amber-500"/>)
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {isCreator && (
 <div className="card-premium p-6 bg-surface">
 <h3 className="font-bold text-base mb-4 text-zinc-950 flex items-center gap-1.5">Pending Requests</h3>
 
 {pendingPlayers.length === 0 ? (
 <p className="text-xs text-muted font-semibold text-center py-4 bg-zinc-50 rounded-2xl border border-dashed border-border">No pending requests.</p>
 ) : (
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
 <span className="text-[10px] text-muted font-bold">Reputation: {p.user?.reputation ?? 0}</span>
 </div>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleAction(p.userId, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">Approve</button>
 <button onClick={() => handleAction(p.userId, 'reject')} className="flex-1 bg-surface border border-border hover:bg-red-50 hover:text-red-600 text-foreground text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer">Reject</button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
};
