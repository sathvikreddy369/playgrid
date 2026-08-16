import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Star, Ban, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import MobileNav from '../components/MobileNav';

export default function MatchManagement() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<Record<string, 'ATTENDED' | 'MISSED'>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManagementData = async () => {
    if (!id) return;
    try {
      const [matchRes, requestsRes, attendanceRes] = await Promise.all([
        api.get(`/matches/${id}`).catch(() => null),
        api.get(`/requests/host/${id}`).catch(() => null),
        api.get(`/users/attendance/${id}`).catch(() => null)
      ]);

      if (matchRes?.data?.match) setMatch(matchRes.data.match);
      if (requestsRes?.data?.requests) setRequests(requestsRes.data.requests);

      if (attendanceRes?.data?.attendances) {
        const initialMap: Record<string, 'ATTENDED' | 'MISSED'> = {};
        attendanceRes.data.attendances.forEach((att: any) => {
          if (att.status === 'ATTENDED' || att.status === 'MISSED') {
            initialMap[att.userId] = att.status;
          }
        });
        setAttendances(initialMap);
      }
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

  const handleToggleAttendance = (userId: string, status: 'ATTENDED' | 'MISSED') => {
    setAttendances((prev) => ({
      ...prev,
      [userId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!id) return;
    setAttendanceSaving(true);
    setAttendanceSuccess(false);
    setError(null);

    try {
      const attendanceRecords = Object.entries(attendances).map(([userId, status]) => ({
        userId,
        status
      }));

      await api.post(`/users/attendance/${id}`, { attendanceRecords });
      setAttendanceSuccess(true);
      await fetchManagementData();
      setTimeout(() => setAttendanceSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save attendance', err);
      setError(err?.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setAttendanceSaving(false);
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
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <h2 className="text-xl text-zinc-400 font-bold">Match not found or access denied</h2>
      </div>
    );
  }

  const totalSlots = match.totalSlots;
  const filledSlots = match.filledSlots;
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 lg:p-8 pb-24 sm:pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{match.title}</h1>
            <p className="text-xs text-zinc-400 mt-1">
              {new Date(match.date).toLocaleDateString()} • Status:{' '}
              <span className="font-semibold text-indigo-400 uppercase">{match.status}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {match.status !== 'CANCELLED' && match.status !== 'COMPLETED' && (
              <button 
                onClick={handleCancelMatch}
                className="px-3.5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl flex items-center gap-1.5 font-bold text-xs transition"
              >
                <Ban className="w-4 h-4" /> Cancel Match
              </button>
            )}
            <Link 
              to={`/review/${match.id}`} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 flex items-center font-bold text-xs shadow-lg transition"
            >
              <Star className="w-4 h-4 mr-1.5" /> Review Match
            </Link>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-1.5 text-center min-w-[90px]">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase">Slots</p>
              <p className="text-base font-extrabold text-white">
                <span className={filledSlots >= totalSlots ? 'text-emerald-400' : 'text-white'}>{filledSlots}</span>
                <span className="text-zinc-500 text-xs"> / {totalSlots}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pending Requests */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending Join Requests ({pendingRequests.length})
            </h2>
            
            <AnimatePresence>
              {pendingRequests.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
                  No pending join requests.
                </div>
              ) : (
                pendingRequests.map((req) => {
                  const userName = req.user?.profile?.name || req.user?.email?.split('@')[0] || 'Player';
                  const reliability = req.user?.profile?.reliabilityScore ?? 100;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={req.id}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-sm text-indigo-400">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{userName}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            PlayGrid Score: <span className="font-bold text-indigo-400">{reliability}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-bold transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'ACCEPTED')}
                          disabled={actionLoading === req.id || filledSlots >= totalSlots}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition disabled:opacity-50 shadow"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Accept
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Right: Confirmed Roster & Host Attendance Flow */}
          <div className="space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Match Roster & Attendance
                </h2>
                {attendanceSuccess && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ✓ Saved!
                  </span>
                )}
              </div>

              {acceptedRequests.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No confirmed participants yet.</p>
              ) : (
                <div className="space-y-3">
                  {acceptedRequests.map((req) => {
                    const userName = req.user?.profile?.name || req.user?.email?.split('@')[0] || 'Player';
                    const currentStatus = attendances[req.userId] || 'PENDING';

                    return (
                      <div key={req.id} className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{userName}</span>
                          <span className={`text-[10px] font-extrabold uppercase ${
                            currentStatus === 'ATTENDED'
                              ? 'text-emerald-400'
                              : currentStatus === 'MISSED'
                              ? 'text-red-400'
                              : 'text-zinc-500'
                          }`}>
                            {currentStatus}
                          </span>
                        </div>

                        {/* Host Attendance Selector */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(req.userId, 'ATTENDED')}
                            className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                              currentStatus === 'ATTENDED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(req.userId, 'MISSED')}
                            className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                              currentStatus === 'MISSED'
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            ✕ Missed
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={handleSaveAttendance}
                    disabled={attendanceSaving}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {attendanceSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Finalize Attendance & Scores
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
