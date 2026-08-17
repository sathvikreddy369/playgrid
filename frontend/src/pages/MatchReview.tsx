import { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] p-4 lg:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {error && (
          <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#E6E8EC] rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8 pb-8 border-b border-[#E6E8EC]">
            <h1 className="text-2xl font-black mb-2 uppercase text-[#172033] tracking-wider">Post-Match Summary</h1>
            <p className="text-[#667085] text-xs font-medium">{match.title} • {new Date(match.date).toLocaleDateString()}</p>
          </div>

          {!isHost ? (
            <form onSubmit={handleSubmitReview} className="space-y-8">
              <div className="text-center">
                <h2 className="text-lg font-bold mb-4 text-[#172033]">How was the match & host?</h2>
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
                            ? 'text-[#FF7A3D] fill-[#FF7A3D]' 
                            : 'text-[#E6E8EC]'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#98A2B3]">Tap a star to rate</p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#667085] ml-1">Write a Review (Optional)</label>
                <textarea 
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors resize-none placeholder:text-[#98A2B3]"
                  placeholder="How was the turf? Was the host friendly?"
                />
              </div>

              <button
                disabled={saving || rating === 0}
                type="submit"
                className="w-full py-3.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white rounded-xl font-bold text-sm shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50 flex justify-center items-center"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold uppercase text-[#172033]">Mark Attendance</h2>
                <p className="text-xs text-[#667085]">Update player stats</p>
              </div>

              {participants.length === 0 ? (
                <p className="text-center text-[#98A2B3] py-6 text-xs italic">No accepted participants to mark attendance for.</p>
              ) : (
                <div className="space-y-3">
                  {participants.map(p => {
                    const userName = p?.profile?.name || p?.email?.split('@')[0] || 'Player';
                    const isAttended = attendanceMap[p.id];

                    return (
                      <div key={p.id} className="bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2457D6] flex items-center justify-center font-bold text-sm text-white shadow-sm">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-xs text-[#172033]">{userName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleAttendanceToggle(p.id, false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                              isAttended === false ? 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30' : 'bg-white border border-[#E6E8EC] text-[#667085] hover:text-[#DC2626]'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            No Show
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleAttendanceToggle(p.id, true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                              isAttended === true ? 'bg-[#16803C]/20 text-[#16803C] border border-[#16803C]/30' : 'bg-white border border-[#E6E8EC] text-[#667085] hover:text-[#16803C]'
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

              <button
                onClick={handleSaveAttendance}
                disabled={saving || Object.keys(attendanceMap).length === 0}
                className="w-full mt-6 py-3.5 bg-[#2457D6] hover:bg-[#1D4ED8] text-white rounded-xl font-bold text-sm shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Save Attendance"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

