import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchDetail, useJoinMatch, useMatchAction } from '../hooks/useMatches';
import { useAuth } from '../providers/AuthProvider';
import { Loader2, ArrowLeft, Calendar, MapPin, Users, IndianRupee, ShieldAlert, Check, X, Star } from 'lucide-react';
import { format } from 'date-fns';

export const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: match, isLoading } = useMatchDetail(id!);
  const joinMatch = useJoinMatch();
  const matchAction = useMatchAction();

  const [ratings, setRatings] = useState<Record<string, number>>({});

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-600" /></div>;
  if (!match) return <div className="text-center py-20">Match not found</div>;

  const isCreator = match.creatorId === user?.id;
  const myRequest = match.players?.find((p: any) => p.userId === user?.id);
  
  const approvedPlayers = match.players?.filter((p: any) => p.status === 'APPROVED' || p.status === 'ATTENDED') || [];
  const pendingPlayers = match.players?.filter((p: any) => p.status === 'PENDING') || [];

  const handleAction = (userId: string | undefined, action: 'approve' | 'reject' | 'attend' | 'cancel') => {
    const rating = action === 'attend' && userId ? ratings[userId] || 3 : undefined;
    if (action === 'attend' && (!rating || rating < 1 || rating > 5)) {
      alert("Please provide a valid rating 1-5 before marking attendance.");
      return;
    }
    matchAction.mutate({ matchId: match.id, userId, action, rating });
  };

  const isPast = new Date(match.date) < new Date();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Match Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
            {match.status === 'CANCELLED' && (
              <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-center text-sm py-1 font-bold">MATCH CANCELLED</div>
            )}
            {match.status === 'FULL' && (
              <div className="absolute top-0 left-0 w-full bg-blue-500 text-white text-center text-sm py-1 font-bold">MATCH FULL</div>
            )}

            <div className="flex justify-between items-start mt-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 font-bold rounded">{match.sport}</span>
              {isCreator && match.status !== 'CANCELLED' && (
                <button onClick={() => handleAction(undefined, 'cancel')} className="text-red-600 text-sm font-medium hover:underline">
                  Cancel Match
                </button>
              )}
            </div>

            <h1 className="text-3xl font-bold mt-4 mb-2">{match.title}</h1>
            
            {match.community && (
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                Linked to Community: <strong>{match.community.name}</strong>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 dark:text-gray-300 mt-6">
              <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /> {format(new Date(match.date), 'PPp')}</div>
              <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-400" /> {match.location}</div>
              <div className="flex items-center gap-3"><Users className="w-5 h-5 text-gray-400" /> {approvedPlayers.length} / {match.maxPlayers} Players</div>
              <div className="flex items-center gap-3"><IndianRupee className="w-5 h-5 text-gray-400" /> {match.costPerPerson || 'Free'}</div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={match.creator.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${match.creator.name}`} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500">Organized by</p>
                  <p className="font-semibold">{match.creator.name}</p>
                </div>
              </div>

              {!isCreator && match.status === 'OPEN' && !myRequest && (
                <button onClick={() => joinMatch.mutate(match.id)} disabled={joinMatch.isPending} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-lg font-medium">
                  {joinMatch.isPending ? 'Requesting...' : 'Request to Join'}
                </button>
              )}

              {!isCreator && myRequest && (
                <div className={`px-6 py-2 rounded-lg font-medium ${myRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : myRequest.status === 'APPROVED' || myRequest.status === 'ATTENDED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Status: {myRequest.status}
                </div>
              )}
            </div>
          </div>

          {/* Player Roster */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg mb-4">Confirmed Players ({approvedPlayers.length})</h3>
            {approvedPlayers.length === 0 ? (
              <p className="text-gray-500 text-sm">No players approved yet.</p>
            ) : (
              <div className="space-y-4">
                {approvedPlayers.map((p: any) => (
                  <div key={p.userId} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={p.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${p.user.name}`} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-sm">{p.user.name} {p.userId === match.creatorId && '(Host)'}</p>
                        <p className="text-xs text-gray-500">Rep: {p.user.reputation}</p>
                      </div>
                    </div>

                    {isCreator && isPast && p.userId !== match.creatorId && p.status === 'APPROVED' && (
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-xs border rounded p-1 bg-white"
                          value={ratings[p.userId] || 3}
                          onChange={(e) => setRatings(prev => ({...prev, [p.userId]: parseInt(e.target.value)}))}
                        >
                          <option value={1}>1 - Poor</option>
                          <option value={2}>2 - Below Avg</option>
                          <option value={3}>3 - Average</option>
                          <option value={4}>4 - Good</option>
                          <option value={5}>5 - Excellent</option>
                        </select>
                        <button onClick={() => handleAction(p.userId, 'attend')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200">
                          Mark Attended
                        </button>
                      </div>
                    )}
                    
                    {p.status === 'ATTENDED' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Attended ({p.performanceRating} <Star className="w-3 h-3 inline fill-current text-yellow-500"/>)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Creator Management */}
        {isCreator && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4">Pending Requests</h3>
              
              {pendingPlayers.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingPlayers.map((p: any) => (
                    <div key={p.userId} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <img src={p.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${p.user.name}`} className="w-6 h-6 rounded-full" />
                        <span className="font-medium text-sm">{p.user.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">Rep: {p.user.reputation}</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleAction(p.userId, 'approve')} className="flex-1 bg-green-600 text-white text-xs font-medium py-1.5 rounded hover:bg-green-700">Approve</button>
                        <button onClick={() => handleAction(p.userId, 'reject')} className="flex-1 bg-red-50 text-red-600 text-xs font-medium py-1.5 rounded hover:bg-red-100">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
