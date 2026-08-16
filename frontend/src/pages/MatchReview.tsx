import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';

export default function MatchReview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  // Host Attendance State: map of userId -> boolean (attended)
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/matches/${id}`);
        const fetchedMatch = res.data.match;
        setMatch(fetchedMatch);

        const acceptedUsers = (fetchedMatch.requests || [])
          .filter((r: any) => r.status === 'ACCEPTED')
          .map((r: any) => r.user);
        
        setParticipants(acceptedUsers);
      } catch (err: any) {
        console.error('Failed to fetch match details for review', err);
        setError(err?.response?.data?.error || 'Failed to load match review');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  const isHost = user && match && match.hostId === user.id;

  const handleAttendanceToggle = (userId: string, attended: boolean) => {
    setAttendanceMap(prev => ({ ...prev, [userId]: attended }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);

    try {
      await api.post(`/reviews/${id}`, {
        rating,
        comment: reviewText
      });
      alert('Review submitted successfully!');
      navigate(`/match/${id}`);
    } catch (err: any) {
      console.error('Failed to submit review', err);
      setError(err?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);

    try {
      for (const [userId, attended] of Object.entries(attendanceMap)) {
        await api.post(`/reviews/attendance/${id}`, { userId, attended });
      }
      alert('Attendance saved successfully!');
      navigate(`/match/${id}`);
    } catch (err: any) {
      console.error('Failed to save attendance', err);
      setError(err?.response?.data?.error || 'Failed to save attendance');
    } finally {
      setSaving(false);
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
        <h2 className="text-xl text-zinc-400">Match not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8 pb-8 border-b border-zinc-800">
            <h1 className="text-2xl font-bold mb-2">Post-Match Summary</h1>
            <p className="text-zinc-400">{match.title} • {new Date(match.date).toLocaleDateString()}</p>
          </div>

          {!isHost ? (
            <form onSubmit={handleSubmitReview} className="space-y-8">
              <div className="text-center">
                <h2 className="text-lg font-bold mb-4">How was the match & host?</h2>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-zinc-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-zinc-500">Tap a star to rate</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Write a Review (Optional)</label>
                <textarea 
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 mt-2 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                  placeholder="How was the turf? Was the host friendly?"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving || rating === 0}
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit Review"
                )}
              </motion.button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Mark Attendance</h2>
                <p className="text-sm text-zinc-400">Update player stats</p>
              </div>

              {participants.length === 0 ? (
                <p className="text-center text-zinc-500 py-6">No accepted participants to mark attendance for.</p>
              ) : (
                <div className="space-y-3">
                  {participants.map(p => {
                    const userName = p?.profile?.name || p?.email?.split('@')[0] || 'Player';
                    const isAttended = attendanceMap[p.id];

                    return (
                      <div key={p.id} className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-indigo-400">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{userName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleAttendanceToggle(p.id, false)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                              isAttended === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            No Show
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleAttendanceToggle(p.id, true)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                              isAttended === true ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Attended
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSaveAttendance}
                disabled={saving || Object.keys(attendanceMap).length === 0}
                className="w-full mt-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                ) : (
                  "Save Attendance"
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

