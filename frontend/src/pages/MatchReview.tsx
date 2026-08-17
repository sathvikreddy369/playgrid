import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trophy, Building, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  // Host Rating & Review State
  const [hostRating, setHostRating] = useState(5);
  const [hostHoverRating, setHostHoverRating] = useState(0);
  const [hostReviewText, setHostReviewText] = useState('');

  // Venue Rating & Review State
  const [venueRating, setVenueRating] = useState(5);
  const [venueHoverRating, setVenueHoverRating] = useState(0);
  const [venueReviewText, setVenueReviewText] = useState('');

  // Host Attendance State: map of userId -> boolean
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

  const handleSubmitPlayerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);

    try {
      // 1. Submit review for host & match
      await api.post(`/reviews/${id}`, {
        rating: hostRating,
        comment: hostReviewText
      }).catch(() => null);

      // 2. Submit venue review if venueId exists
      if (match?.venueId) {
        await api.post(`/venues/${match.venueId}/reviews`, {
          rating: venueRating,
          comment: venueReviewText,
          matchId: id
        }).catch(() => null);
      }

      alert('Review & ratings submitted successfully!');
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
      <div className="min-h-screen bg-[#F7F7F2] text-[#172033] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] text-[#172033] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Match Not Found</h2>
        <Link to="/dashboard" className="px-4 py-2 bg-[#2457D6] text-white rounded-xl text-xs font-bold uppercase">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] p-4 lg:p-8 font-sans pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Link to={`/match/${match.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-[#667085] hover:text-[#172033] uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to Match
        </Link>

        {error && (
          <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#E6E8EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center pb-6 border-b border-[#E6E8EC]">
            <span className="text-xs font-black uppercase px-3 py-1 bg-[#2457D6]/10 text-[#2457D6] rounded-full border border-[#2457D6]/20">
              Post-Game Feedback & Rating
            </span>
            <h1 className="text-2xl font-black mt-3 uppercase text-[#172033] tracking-tight">{match.title}</h1>
            <p className="text-[#667085] text-xs font-medium mt-1">
              {new Date(match.date).toLocaleDateString()} • {match.locationText || 'Hyderabad'}
            </p>
          </div>

          {!isHost ? (
            <form onSubmit={handleSubmitPlayerReview} className="space-y-8">
              {/* Section 1: Rate Host */}
              <div className="bg-[#F7F7F2] border border-[#E6E8EC] p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-[#172033] uppercase">
                  <Trophy className="w-5 h-5 text-[#FF7A3D]" /> Rate Host ({match.host?.profile?.name || 'Game Host'})
                </div>
                
                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHostHoverRating(star)}
                      onMouseLeave={() => setHostHoverRating(0)}
                      onClick={() => setHostRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-9 h-9 transition-colors ${
                          star <= (hostHoverRating || hostRating) 
                            ? 'text-[#FF7A3D] fill-[#FF7A3D]' 
                            : 'text-[#98A2B3]/30 fill-[#98A2B3]/10'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase mb-1">Host Comments (Optional)</label>
                  <textarea 
                    value={hostReviewText}
                    onChange={e => setHostReviewText(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#2457D6]"
                    placeholder="Was the host punctual? Were teams well balanced?"
                  />
                </div>
              </div>

              {/* Section 2: Rate Venue */}
              <div className="bg-[#F7F7F2] border border-[#E6E8EC] p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-[#172033] uppercase">
                  <Building className="w-5 h-5 text-[#2457D6]" /> Rate Venue / Turf Quality
                </div>
                
                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setVenueHoverRating(star)}
                      onMouseLeave={() => setVenueHoverRating(0)}
                      onClick={() => setVenueRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-9 h-9 transition-colors ${
                          star <= (venueHoverRating || venueRating) 
                            ? 'text-[#2457D6] fill-[#2457D6]' 
                            : 'text-[#98A2B3]/30 fill-[#98A2B3]/10'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase mb-1">Venue Comments & Amenities Review</label>
                  <textarea 
                    value={venueReviewText}
                    onChange={e => setVenueReviewText(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#2457D6]"
                    placeholder="How was the turf quality, floodlights, parking, and cleanliness?"
                  />
                </div>
              </div>

              <button
                disabled={saving}
                type="submit"
                className="w-full py-4 bg-[#FF7A3D] hover:bg-[#EA622D] text-white rounded-xl font-black text-xs shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50 flex justify-center items-center"
              >
                {saving ? 'Submitting Review...' : 'Submit Ratings & Review'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold uppercase text-[#172033]">Mark Player Attendance</h2>
                <p className="text-xs text-[#667085]">Verified hosts update player scores</p>
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
                className="w-full mt-6 py-4 bg-[#2457D6] hover:bg-[#1D4ED8] text-white rounded-xl font-black text-xs shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? 'Saving Attendance...' : 'Save Attendance Scores'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
