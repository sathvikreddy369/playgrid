import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Star, Ban } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';

export default function MatchManagement() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchManagementData = async () => {
    if (!id) return;
    try {
      const [matchRes, requestsRes] = await Promise.all([
        api.get(`/matches/${id}`),
        api.get(`/requests/host/${id}`)
      ]);
      setMatch(matchRes.data.match);
      setRequests(requestsRes.data.requests);
    } catch (err: any) {
      console.error('Failed to fetch management data', err);
      setError(err?.response?.data?.error || 'Failed to load match management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagementData();
  }, [id]);

  const handleAction = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    setActionLoading(requestId);
    setError(null);
    try {
      await api.post(`/requests/action/${requestId}`, { action });
      await fetchManagementData();
    } catch (err: any) {
      console.error('Failed to handle request action', err);
      setError(err?.response?.data?.error || 'Failed to update request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelMatch = async () => {
    if (!id || !window.confirm('Are you sure you want to cancel this match? All participants will be notified.')) return;
    try {
      await api.post(`/matches/${id}/cancel`);
      await fetchManagementData();
    } catch (err: any) {
      console.error('Failed to cancel match', err);
      setError(err?.response?.data?.error || 'Failed to cancel match');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <h2 className="text-xl text-zinc-400">Match not found or access denied</h2>
      </div>
    );
  }

  const totalSlots = match.totalSlots;
  const filledSlots = match.filledSlots;
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{match.title}</h1>
            <p className="text-zinc-400 mt-1">
              {new Date(match.date).toLocaleDateString()} • Status: <span className="font-semibold text-indigo-400">{match.status}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {match.status !== 'CANCELLED' && match.status !== 'COMPLETED' && (
              <button 
                onClick={handleCancelMatch}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-2xl flex items-center gap-2 font-medium text-sm transition-colors"
              >
                <Ban className="w-4 h-4" />
                Cancel Match
              </button>
            )}
            <Link to={`/review/${match.id}`} className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl px-5 py-2 flex items-center justify-center font-bold text-sm shadow-lg transition-colors">
              <Star className="w-4 h-4 mr-2" />
              Review Match
            </Link>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-center min-w-[100px]">
              <p className="text-xs text-zinc-400 font-medium mb-0.5">Slots Filled</p>
              <p className="text-xl font-bold">
                <span className={filledSlots >= totalSlots ? 'text-emerald-400' : 'text-white'}>{filledSlots}</span>
                <span className="text-zinc-500 text-base"> / {totalSlots}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Pending Requests ({pendingRequests.length})
            </h2>
            
            <AnimatePresence>
              {pendingRequests.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-500">
                  No pending requests right now.
                </div>
              ) : (
                pendingRequests.map(req => {
                  const userName = req.user?.profile?.name || req.user?.email?.split('@')[0] || 'Player';
                  const level = req.user?.profile?.levels?.[0] || 'Intermediate';
                  const matchesAttended = req.user?.profile?.matchesAttended || 0;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={req.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg text-indigo-400">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{userName}</h3>
                          <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                            <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{level}</span>
                            <span>{matchesAttended} matches played</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          disabled={actionLoading === req.id}
                          className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'ACCEPTED')}
                          disabled={actionLoading === req.id || filledSlots >= totalSlots}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl flex items-center gap-2 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Roster / Accepted */}
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-indigo-400" />
                Current Roster ({acceptedRequests.length})
              </h2>
              
              <div className="space-y-4">
                {acceptedRequests.map(req => {
                  const userName = req.user?.profile?.name || req.user?.email?.split('@')[0] || 'Player';
                  const level = req.user?.profile?.levels?.[0] || 'Player';

                  return (
                    <motion.div layout key={req.id} className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-indigo-400">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{userName}</p>
                          <p className="text-xs text-zinc-500">{level}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty slots placeholders */}
                {Array.from({ length: Math.max(0, totalSlots - filledSlots) }).slice(0, 3).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-zinc-800 text-zinc-600">
                    <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700" />
                    <p className="text-sm font-medium">Available Slot</p>
                  </div>
                ))}
                {totalSlots - filledSlots > 3 && (
                  <div className="text-center text-xs text-zinc-500 pt-2">
                    + {totalSlots - filledSlots - 3} more slots available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

