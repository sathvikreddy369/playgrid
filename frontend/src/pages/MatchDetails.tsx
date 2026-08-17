import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Users, CheckCircle, AlertCircle, MessageSquare, ExternalLink, Flag, Star, Navigation } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';
import MapboxPicker from '../components/MapboxPicker';
import { getGoogleMapsDirectionsUrl } from '../utils/location';

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const { user: supabaseAuthUser } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fraud Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Fraud/Scam');
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    const fetchMatchAndUser = async () => {
      if (!id) return;
      try {
        const [matchRes, profileRes] = await Promise.all([
          api.get(`/matches/${id}`),
          api.get('/users/profile').catch(() => null)
        ]);

        if (matchRes.data?.match) {
          setMatch(matchRes.data.match);
        }
        if (profileRes?.data?.profile) {
          setDbUser(profileRes.data.profile);
        }
      } catch (err: any) {
        console.error('Failed to load match details', err);
        setErrorMessage(err?.response?.data?.error || 'Failed to load match details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchAndUser();
  }, [id]);

  const handleJoinRequest = async () => {
    if (!id) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await api.post(`/matches/${id}/requests`);
      alert('Join request sent! The host will review your request.');
      const res = await api.get(`/matches/${id}`);
      setMatch(res.data.match);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Failed to send join request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.post('/reports', {
        targetType: 'MATCH',
        targetId: id,
        reason: reportReason,
        description: reportText
      });
      alert('Report submitted to Admin Moderation.');
      setShowReportModal(false);
      setReportText('');
    } catch (err) {
      alert('Failed to submit report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] text-[#172033] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
        <p className="text-sm text-[#667085] mb-6">The requested sports match could not be found.</p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-[#2457D6] text-white font-semibold text-sm rounded-xl">
          Back to Matches
        </Link>
      </div>
    );
  }

  const isHost = dbUser?.id ? match.hostId === dbUser.id : match.host?.supabaseId === supabaseAuthUser?.id;
  const isMatchPassed = new Date(match.date) < new Date();
  const isMatchFull = match.filledSlots >= match.totalSlots;
  const acceptedRequests = match.requests?.filter((r: any) => r.status === 'ACCEPTED') || [];
  const mapsUrl = getGoogleMapsDirectionsUrl(match.latitude, match.longitude);
  const myRequest = match.requests?.find((r: any) => r.userId === dbUser?.id);

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-28 sm:pb-16">
      {/* Top Header Navbar - Clean Layout */}
      <header className="border-b border-[#E6E8EC] bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#667085] hover:text-[#172033] transition uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
          
          <button
            onClick={() => setShowReportModal(true)}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/50"
          >
            <Flag className="w-3.5 h-3.5" /> Report Match
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Action Failed</p>
              <p className="text-xs text-[#DC2626] mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Hero Details Header */}
        <section className="bg-white border border-[#E6E8EC] rounded-2xl p-6 shadow-sm space-y-4">
          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#2457D6]/10 border border-[#2457D6]/20 rounded-lg text-xs font-extrabold text-[#2457D6] uppercase tracking-wider">
              {match.matchType === 'E_GAME' ? `🎮 ${match.eGameName}` : `#${match.tags?.[0] || 'sports'}`}
            </span>
            {match.tags?.map((tag: string) => (
              <span key={tag} className="px-2.5 py-1 bg-[#F7F7F2] border border-[#E6E8EC] rounded-lg text-xs font-bold text-[#667085] uppercase">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">{match.title}</h1>
              <p className="text-xs text-[#667085] flex items-center gap-1 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#2457D6] shrink-0" />
                {match.locationText || 'Hyderabad'}
              </p>
            </div>

            {/* Google Maps Redirect Button */}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2457D6]/10 hover:bg-[#2457D6]/20 border border-[#2457D6]/30 text-[#2457D6] font-bold text-xs rounded-xl shadow-sm transition-colors uppercase tracking-wider shrink-0"
              >
                <Navigation className="w-4 h-4" /> Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Organizer Card */}
          <div className="pt-4 border-t border-[#E6E8EC] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2457D6] text-white font-black text-sm flex items-center justify-center shadow-sm">
                {match.host?.profile?.name?.[0]?.toUpperCase() || 'H'}
              </div>
              <div>
                <p className="font-bold text-[#172033] text-sm">{match.host?.profile?.name || 'Game Host'}</p>
                <p className="text-[#667085] text-[11px]">Match Host • Hyderabad</p>
              </div>
            </div>

            {isHost ? (
              <Link
                to={`/manage/${match.id}`}
                className="px-4 py-2 bg-[#2457D6] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl uppercase tracking-wider"
              >
                Manage Requests
              </Link>
            ) : (
              <Link
                to={`/messages?user=${match.hostId}`}
                className="px-3.5 py-2 border border-[#E6E8EC] hover:bg-gray-50 font-bold text-xs text-[#172033] rounded-xl flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#2457D6]" /> Chat Host
              </Link>
            )}
          </div>
        </section>

        {/* Date & Location Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6E8EC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#98A2B3] tracking-wider">
              <Calendar className="w-4 h-4 text-[#2457D6]" /> Date & Time
            </div>
            <p className="text-lg font-black text-[#172033]">
              {new Date(match.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-xs text-[#667085] flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
              {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#98A2B3] tracking-wider">
              <MapPin className="w-4 h-4 text-[#16803C]" /> Venue Location
            </div>
            <p className="text-sm font-bold text-[#172033]">{match.locationText || 'Custom Venue'}</p>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2457D6] hover:underline"
              >
                Navigate via Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </section>

        {/* Player Roster Section */}
        <section className="bg-white border border-[#E6E8EC] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E8EC] pb-4">
            <h2 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2457D6]" /> Player Roster & Capacity
            </h2>
            <span className="text-xs font-bold text-[#2457D6]">
              {match.filledSlots} / {match.totalSlots} Slots Filled
            </span>
          </div>

          <div className="w-full bg-[#F7F7F2] rounded-full h-2 overflow-hidden border border-[#E6E8EC]">
            <div
              className="h-full bg-[#2457D6] rounded-full"
              style={{ width: `${Math.min(100, (match.filledSlots / match.totalSlots) * 100)}%` }}
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase text-[#98A2B3]">Confirmed Participants</p>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-2 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2457D6] text-white flex items-center justify-center text-[10px]">
                  {match.host?.profile?.name?.[0]?.toUpperCase() || 'H'}
                </span>
                {match.host?.profile?.name || 'Host'}
                <span className="px-1.5 py-0.5 bg-[#2457D6]/10 text-[#2457D6] text-[10px] font-black rounded uppercase">HOST</span>
              </div>

              {acceptedRequests.map((r: any) => (
                <div key={r.id} className="px-3 py-2 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#16803C] text-white flex items-center justify-center text-[10px]">
                    {r.user?.profile?.name?.[0]?.toUpperCase() || 'P'}
                  </span>
                  {r.user?.profile?.name || 'Player'}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Game & Rules */}
        <section className="bg-white border border-[#E6E8EC] rounded-2xl p-6 shadow-sm space-y-2">
          <h2 className="text-base font-extrabold text-[#172033]">About Game & Rules</h2>
          <p className="text-xs text-[#667085] leading-relaxed whitespace-pre-line">
            {match.description || 'No additional match rules specified by host.'}
          </p>
        </section>

        {/* Mapbox Location Pin */}
        {match.latitude && match.longitude && (
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#172033]">Venue Location Pin</h2>
            <MapboxPicker initialLat={match.latitude} initialLng={match.longitude} readOnly />
          </section>
        )}

        {/* Post-Game Ratings & Reviews Prompt */}
        {(isMatchPassed || myRequest?.status === 'ACCEPTED') && (
          <section className="bg-[#2457D6]/5 border border-[#2457D6]/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase text-[#2457D6]">Played this match?</span>
              <h3 className="text-base font-black text-[#172033]">Rate Host & Venue Quality</h3>
              <p className="text-xs text-[#667085] mt-0.5">Share feedback about turf quality, floodlights, and host coordination.</p>
            </div>
            <Link
              to={`/review/${match.id}`}
              className="px-6 py-3 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm flex items-center gap-2 shrink-0"
            >
              <Star className="w-4 h-4 fill-white" /> Leave Review
            </Link>
          </section>
        )}
      </main>

      {/* Bottom Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E6E8EC] bg-white/95 backdrop-blur-md p-4 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#98A2B3] uppercase font-bold block">Match Entry Fee</span>
            <span className="text-xl font-black text-[#172033]">
              {match.pricePerHead === 0 || !match.pricePerHead ? 'Free' : `₹${match.pricePerHead}`}
              <span className="text-xs text-[#667085] font-semibold"> / player</span>
            </span>
          </div>

          {!isHost && (
            <div>
              {myRequest?.status === 'PENDING' ? (
                <span className="px-5 py-3 bg-[#FF7A3D]/10 border border-[#FF7A3D]/20 text-[#FF7A3D] font-black text-xs rounded-xl uppercase tracking-wider">
                  Request Sent (Pending Approval)
                </span>
              ) : myRequest?.status === 'ACCEPTED' ? (
                <span className="px-5 py-3 bg-[#16803C]/10 border border-[#16803C]/20 text-[#16803C] font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> You're Confirmed
                </span>
              ) : isMatchPassed ? (
                <span className="px-5 py-3 bg-gray-100 text-[#98A2B3] font-black text-xs rounded-xl uppercase tracking-wider">
                  Match Completed
                </span>
              ) : isMatchFull ? (
                <span className="px-5 py-3 bg-amber-100 text-amber-800 font-black text-xs rounded-xl uppercase tracking-wider">
                  Match Full
                </span>
              ) : (
                <button
                  onClick={handleJoinRequest}
                  disabled={actionLoading}
                  className="px-6 py-3.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-black text-xs rounded-xl shadow-sm uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Request to Join Game'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fraud Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E6E8EC] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-[#172033] uppercase">Report Match / Host</h3>
            <p className="text-xs text-[#667085]">Help keep the GAMEVIA community safe from fraud and fake games.</p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033]"
                >
                  <option value="Fraud/Scam">Fraud / Scam</option>
                  <option value="Fake Venue">Fake Venue Information</option>
                  <option value="Harassment">Harassment or Toxic Behavior</option>
                  <option value="No-Show Host">No-Show Host</option>
                  <option value="Spam">Spam / Misleading Title</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Details (Optional)</label>
                <textarea
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Provide additional details..."
                  className="w-full px-4 py-2.5 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-medium text-[#172033]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-[#E6E8EC] text-xs font-bold text-[#667085] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl uppercase"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
