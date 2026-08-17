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
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans p-4 lg:p-8 pb-24 sm:pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {error && (
          <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033]">{match.title}</h1>
            <p className="text-xs text-[#667085] mt-1 font-medium">
              {new Date(match.date).toLocaleDateString()} • Status:{' '}
              <span className="font-bold text-[#2457D6] uppercase">{match.status}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {match.status !== 'CANCELLED' && match.status !== 'COMPLETED' && (
              <button 
                onClick={handleCancelMatch}
                className="px-3.5 py-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/20 rounded-xl flex items-center gap-1.5 font-bold text-xs transition"
              >
                <Ban className="w-4 h-4" /> Cancel Match
              </button>
            )}
            <Link 
              to={`/review/${match.id}`} 
              className="bg-[#2457D6] hover:bg-[#1D4ED8] text-white rounded-xl px-4 py-2 flex items-center font-bold text-xs shadow-sm transition uppercase tracking-wider"
            >
              <Star className="w-4 h-4 mr-1.5" /> Review Match
            </Link>
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-1.5 text-center min-w-[90px] shadow-sm">
              <p className="text-[10px] text-[#98A2B3] font-bold uppercase tracking-wider">Slots</p>
              <p className="text-base font-black text-[#172033]">
                <span className={filledSlots >= totalSlots ? 'text-[#16803C]' : 'text-[#172033]'}>{filledSlots}</span>
                <span className="text-[#98A2B3] text-xs"> / {totalSlots}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pending Requests */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D97706]" />
              Pending Join Requests ({pendingRequests.length})
            </h2>
            
            <AnimatePresence>
              {pendingRequests.length === 0 ? (
                <div className="bg-white border border-[#E6E8EC] rounded-xl p-8 text-center text-[#98A2B3] text-xs shadow-sm">
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
                      className="bg-white border border-[#E6E8EC] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2457D6] flex items-center justify-center font-bold text-sm text-white shadow-sm">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#172033]">{userName}</h3>
                          <p className="text-xs text-[#667085] mt-0.5 font-medium">
                            GAMEVIA Score: <span className="font-bold text-[#2457D6]">{reliability}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E6E8EC] hover:bg-[#DC2626]/10 text-[#667085] hover:text-[#DC2626] text-xs font-bold transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'ACCEPTED')}
                          disabled={actionLoading === req.id || filledSlots >= totalSlots}
                          className="px-4 py-1.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl flex items-center gap-1 transition disabled:opacity-50 shadow-sm uppercase tracking-wider"
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
            <div className="bg-white border border-[#E6E8EC] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2457D6]" />
                  Match Roster & Attendance
                </h2>
                {attendanceSuccess && (
                  <span className="text-[10px] font-bold text-[#16803C] bg-[#16803C]/10 px-2 py-0.5 rounded border border-[#16803C]/20">
                    ✓ Saved!
                  </span>
                )}
              </div>

              {acceptedRequests.length === 0 ? (
                <p className="text-xs text-[#98A2B3] italic">No confirmed participants yet.</p>
              ) : (
                <div className="space-y-3">
                  {acceptedRequests.map((req) => {
                    const userName = req.user?.profile?.name || req.user?.email?.split('@')[0] || 'Player';
                    const currentStatus = attendances[req.userId] || 'PENDING';

                    return (
                      <div key={req.id} className="bg-[#F7F7F2] p-3 rounded-xl border border-[#E6E8EC] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#172033]">{userName}</span>
                          <span className={`text-[10px] font-extrabold uppercase ${
                            currentStatus === 'ATTENDED'
                              ? 'text-[#16803C]'
                              : currentStatus === 'MISSED'
                              ? 'text-[#DC2626]'
                              : 'text-[#D97706]'
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
                                ? 'bg-[#16803C] text-white shadow-sm'
                                : 'bg-white text-[#667085] hover:text-[#172033] border border-[#E6E8EC]'
                            }`}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(req.userId, 'MISSED')}
                            className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                              currentStatus === 'MISSED'
                                ? 'bg-[#DC2626] text-white shadow-sm'
                                : 'bg-white text-[#667085] hover:text-[#172033] border border-[#E6E8EC]'
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
                    className="w-full py-2.5 bg-[#2457D6] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider disabled:opacity-50"
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
