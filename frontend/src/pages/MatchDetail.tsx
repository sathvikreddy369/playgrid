import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchDetail, useJoinMatch, useMatchAction, useAddMatchComment } from '../hooks/useMatches';
import { useAuth } from '../providers/AuthProvider';
import { Loader2, ArrowLeft, Calendar, MapPin, Users, IndianRupee, ShieldAlert, Check, X, Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';
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
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <Skeleton className="h-8 w-24 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-8"><Skeleton className="h-64 w-full" /></div>
        <div className="card p-6"><Skeleton className="h-96 w-full" /></div>
      </div>
    </div>
  );
  if (!match) return <div className="text-center py-20 text-muted font-medium">Match not found</div>;

  const isCreator = match.creatorId === user?.id;
  const myRequest = match.players?.find((p: MatchPlayer) => p.userId === user?.id);
  
  const approvedPlayers = match.players?.filter((p: MatchPlayer) => p.status === 'APPROVED' || p.status === 'ATTENDED') || [];
  const pendingPlayers = match.players?.filter((p: MatchPlayer) => p.status === 'PENDING') || [];

  const handleAction = (userId: string | undefined, action: 'approve' | 'reject' | 'attend' | 'cancel') => {
    const rating = action === 'attend' && userId ? ratings[userId] || 3 : undefined;
    if (action === 'attend' && (!rating || rating < 1 || rating > 5)) {
      alert("Please provide a valid rating 1-5 before marking attendance.");
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-foreground mb-6 font-medium transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Match Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card relative overflow-hidden">
            {match.status === 'CANCELLED' && (
              <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-center text-xs tracking-wider py-1.5 font-bold uppercase z-10 shadow-sm">MATCH CANCELLED</div>
            )}
            {match.status === 'FULL' && (
              <div className="absolute top-0 left-0 w-full bg-blue-500 text-white text-center text-xs tracking-wider py-1.5 font-bold uppercase z-10 shadow-sm">MATCH FULL</div>
            )}

            <div className={`p-6 md:p-8 ${match.status !== 'OPEN' ? 'pt-10 md:pt-12' : ''}`}>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 font-black tracking-wider uppercase text-xs rounded-md">{match.sport}</span>
                {isCreator && match.status !== 'CANCELLED' && (
                  <button onClick={() => handleAction(undefined, 'cancel')} className="text-red-500 text-sm font-bold hover:underline">
                    Cancel Match
                  </button>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-foreground mt-4 mb-3 leading-tight">{match.title}</h1>
              
              {match.community && (
                <div className="mb-8 inline-flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg font-medium border border-primary-100 dark:border-primary-900/50">
                  <ShieldAlert className="w-4 h-4" />
                  Linked to: <strong>{match.community.name}</strong>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-foreground font-medium bg-surface/50 p-5 rounded-2xl border border-border">
                <div className="flex items-center gap-3"><div className="p-2 bg-background rounded-lg border border-border shadow-sm"><Calendar className="w-5 h-5 text-muted" /></div> <span>{format(new Date(match.date), 'PPp')}</span></div>
                <div className="flex items-center gap-3"><div className="p-2 bg-background rounded-lg border border-border shadow-sm"><MapPin className="w-5 h-5 text-muted" /></div> <span className="truncate">{match.location}</span></div>
                <div className="flex items-center gap-3"><div className="p-2 bg-background rounded-lg border border-border shadow-sm"><Users className="w-5 h-5 text-muted" /></div> <span>{approvedPlayers.length} / {match.maxPlayers} Players</span></div>
                <div className="flex items-center gap-3"><div className="p-2 bg-background rounded-lg border border-border shadow-sm"><IndianRupee className="w-5 h-5 text-muted" /></div> <span>{match.costPerPerson ? `₹${match.costPerPerson} per person` : 'Free'}</span></div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img loading="lazy" decoding="async" src={match.creator.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${match.creator.name}`} alt={match.creator.name} className="w-11 h-11 rounded-full border-2 border-surface shadow-sm bg-border shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Host</p>
                    <p className="font-bold text-foreground">{match.creator.name}</p>
                  </div>
                </div>

                {!isCreator && match.status === 'OPEN' && !myRequest && (
                  <button onClick={() => joinMatch.mutate(match.id)} disabled={joinMatch.isPending} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50">
                    {joinMatch.isPending ? 'Requesting...' : 'Request to Join'}
                  </button>
                )}

                {!isCreator && myRequest && (
                  <div className={`px-6 py-2.5 rounded-full font-bold shadow-sm ${myRequest.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : myRequest.status === 'APPROVED' || myRequest.status === 'ATTENDED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    Status: {myRequest.status}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card p-6 md:p-8">
            <h3 className="font-black text-xl mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-muted" /> Match Discussion</h3>
            <div className="space-y-5 mb-6">
              {match.comments?.length > 0 ? (
                match.comments.map((comment: MatchComment) => (
                  <div key={comment.id} className="flex gap-4">
                    <img loading="lazy" decoding="async" src={comment.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user.name}`} alt={comment.user.name} className="w-9 h-9 rounded-full bg-border shrink-0" />
                    <div className="flex-1">
                      <div className="bg-surface border border-border rounded-2xl rounded-tl-none px-4 py-3">
                        <p className="text-[13px] font-bold text-foreground mb-1">{comment.user.name}</p>
                        <p className="text-[15px] text-muted leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-surface/50 rounded-xl border border-dashed border-border">
                  <p className="text-muted font-medium">No comments yet. Start the discussion!</p>
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
                  className="flex-1 px-4 py-2.5 border border-border rounded-full bg-surface text-[15px] text-foreground focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  disabled={addComment.isPending}
                />
                <button
                  type="submit"
                  disabled={addComment.isPending || !commentContent.trim()}
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 active:scale-95"
                >
                  {addComment.isPending ? 'Posting...' : 'Post'}
                </button>
              </form>
            ) : (
              <p className="text-sm font-medium text-muted bg-surface/50 border border-border p-3 rounded-lg text-center">Only approved players can comment on this match.</p>
            )}
          </div>
        </div>

        {/* Right Col: Player Roster & Creator Management */}
        <div className="space-y-6">
          {/* Player Roster */}
          <div className="card p-6">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-muted" /> Roster ({approvedPlayers.length})</h3>
            {approvedPlayers.length === 0 ? (
              <p className="text-muted text-[15px] font-medium text-center py-6 bg-surface/50 rounded-xl border border-dashed border-border">No players confirmed yet.</p>
            ) : (
              <div className="space-y-4">
                {approvedPlayers.map((p: MatchPlayer) => (
                  <div key={p.userId} className="flex flex-col gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img loading="lazy" decoding="async" src={p.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${p.user.name}`} alt={p.user.name} className="w-10 h-10 rounded-full bg-border" />
                      <div>
                        <p className="font-bold text-foreground text-[15px]">{p.user.name} {p.userId === match.creatorId && <span className="text-[10px] bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded ml-1 uppercase tracking-wider">Host</span>}</p>
                        <p className="text-[12px] text-muted font-medium">Rep: {p.user.reputation}</p>
                      </div>
                    </div>

                    {isCreator && isPast && p.userId !== match.creatorId && p.status === 'APPROVED' && (
                      <div className="flex items-center gap-2 mt-1">
                        <select 
                          className="flex-1 text-[13px] border border-border rounded-lg px-2 py-1.5 bg-surface text-foreground font-medium outline-none focus:border-primary-500"
                          value={ratings[p.userId] || 3}
                          onChange={(e) => setRatings(prev => ({...prev, [p.userId]: parseInt(e.target.value)}))}
                        >
                          <option value={1}>1 - Poor</option>
                          <option value={2}>2 - Below Avg</option>
                          <option value={3}>3 - Average</option>
                          <option value={4}>4 - Good</option>
                          <option value={5}>5 - Excellent</option>
                        </select>
                        <button onClick={() => handleAction(p.userId, 'attend')} className="text-[13px] bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shadow-sm">
                          Confirm
                        </button>
                      </div>
                    )}
                    
                    {p.status === 'ATTENDED' && (
                      <div className="text-[12px] bg-surface border border-border text-muted px-2.5 py-1.5 rounded-md font-bold flex items-center gap-1.5 self-start">
                        <Check className="w-3.5 h-3.5 text-green-500" /> Attended ({p.performanceRating} <Star className="w-3.5 h-3.5 inline fill-current text-yellow-500"/>)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isCreator && (
            <div className="card p-6 border-orange-500/30">
              <h3 className="font-black text-lg mb-4 text-orange-600 dark:text-orange-400">Pending Requests</h3>
              
              {pendingPlayers.length === 0 ? (
                <p className="text-muted text-[15px] font-medium text-center py-4 bg-surface/50 rounded-xl border border-dashed border-border">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingPlayers.map((p: MatchPlayer) => (
                    <div key={p.userId} className="flex flex-col gap-3 p-4 bg-surface rounded-xl border border-border shadow-sm">
                      <div className="flex items-center gap-3">
                        <img loading="lazy" decoding="async" src={p.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${p.user.name}`} alt={p.user.name} className="w-8 h-8 rounded-full bg-border" />
                        <div>
                          <span className="font-bold text-foreground text-[14px] block">{p.user.name}</span>
                          <span className="text-[11px] text-muted font-medium">Rep: {p.user.reputation}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleAction(p.userId, 'approve')} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-[13px] font-bold py-2 rounded-lg transition-colors shadow-sm active:scale-95">Approve</button>
                        <button onClick={() => handleAction(p.userId, 'reject')} className="flex-1 bg-background border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-foreground text-[13px] font-bold py-2 rounded-lg transition-colors active:scale-95">Reject</button>
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
