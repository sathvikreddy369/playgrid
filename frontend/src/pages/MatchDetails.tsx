import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Shield, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';
import MapboxPicker from '../components/MapboxPicker';
import MobileNav from '../components/MobileNav';

export default function MatchDetails() {
  const { id } = useParams();
  const { user: supabaseAuthUser } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('NONE');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMatchAndUser = async () => {
      try {
        setLoading(true);
        // Fetch current user DB profile
        let userDbData: any = null;
        try {
          const userRes = await api.get('/users/profile');
          userDbData = userRes.data?.user || null;
          setDbUser(userDbData);
        } catch (e) {
          console.error('Could not load user DB profile', e);
        }

        // Fetch Match details
        const matchRes = await api.get(`/matches/${id}`);
        const matchData = matchRes.data.match;
        setMatch(matchData);

        // Check if current user has an existing request in DB
        if (userDbData && matchData?.requests) {
          const existing = matchData.requests.find(
            (r: any) => r.userId === userDbData.id || r.user?.supabaseId === supabaseAuthUser?.id
          );
          if (existing) {
            setRequestStatus(existing.status);
          }
        }
      } catch (err) {
        console.error('Failed to load match details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadMatchAndUser();
  }, [id, supabaseAuthUser]);

  const handleRequestJoin = async () => {
    if (!id || !supabaseAuthUser) return;
    setRequesting(true);
    setErrorMessage(null);
    try {
      await api.post(`/requests/${id}`);
      setRequestStatus('PENDING');
    } catch (err: any) {
      console.error('Failed to request join', err);
      const apiErr = err.response?.data?.error || 'Failed to join match. Please try again.';
      setErrorMessage(apiErr);
    } finally {
      setRequesting(false);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!id || !supabaseAuthUser) return;
    setRequesting(true);
    setErrorMessage(null);
    try {
      await api.delete(`/requests/${id}`);
      setRequestStatus('NONE');
    } catch (err: any) {
      console.error('Failed to withdraw request', err);
      const apiErr = err.response?.data?.error || 'Failed to withdraw request.';
      setErrorMessage(apiErr);
    } finally {
      setRequesting(false);
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
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-zinc-300 mb-2">Game Not Found</h2>
        <p className="text-sm text-zinc-500 mb-6">The requested sports match could not be found.</p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition">
          Back to Matches
        </Link>
      </div>
    );
  }

  const isHost = dbUser?.id ? match.hostId === dbUser.id : match.host?.supabaseId === supabaseAuthUser?.id;
  const isMatchPassed = new Date(match.date) < new Date();
  const isMatchFull = match.filledSlots >= match.totalSlots;
  const acceptedRequests = match.requests?.filter((r: any) => r.status === 'ACCEPTED') || [];

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-24 sm:pb-12">
      {/* Top Header */}
      <header className="border-b border-[#E6E8EC] bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#667085] hover:text-[#172033] transition uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
          <div className="flex items-center gap-2">
            {match.tags?.map((tag: string) => (
              <span key={tag} className="px-2.5 py-0.5 bg-[#2457D6]/10 border border-[#2457D6]/20 rounded-md text-xs font-bold text-[#2457D6] uppercase">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Error Alert Banner */}
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
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-[#2457D6]/10 border border-[#2457D6]/20 text-[#2457D6] text-xs font-extrabold rounded-md uppercase">
              {match.tags?.[0] || 'Sport'}
            </span>
            <span className="text-xs text-[#667085] font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#98A2B3]" />
              {match.locationText?.split(',')[0] || 'Hyderabad'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#172033] leading-tight">
            {match.title}
          </h1>

          {/* Host By Line */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-[#2457D6] flex items-center justify-center font-bold text-white shadow-sm">
              {match.host?.profile?.name?.[0]?.toUpperCase() || 'H'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#172033]">{match.host?.profile?.name || 'Match Host'}</p>
              <p className="text-xs text-[#667085]">Game Organizer • Hyderabad</p>
            </div>
          </div>
        </section>

        <hr className="border-[#E6E8EC]" />

        {/* Essential Info Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="p-2.5 bg-[#2457D6]/10 rounded-xl text-[#2457D6] border border-[#2457D6]/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#98A2B3] tracking-wider">Date & Time</p>
              <p className="text-base font-bold text-[#172033] mt-0.5">{new Date(match.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="p-2.5 bg-[#16803C]/10 rounded-xl text-[#16803C] border border-[#16803C]/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#98A2B3] tracking-wider">Venue Location</p>
              <p className="text-base font-bold text-[#172033] mt-0.5">{match.locationText || 'Hyderabad Venue'}</p>
              {match.mapLink && (
                <a href={match.mapLink} target="_blank" rel="noreferrer" className="text-xs text-[#2457D6] hover:underline mt-0.5 block font-bold">
                  Open Google Maps →
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Slot Capacity & Players Roster */}
        <section className="bg-white border border-[#E6E8EC] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2457D6]" />
              <h2 className="text-base font-extrabold text-[#172033]">Player Roster & Capacity</h2>
            </div>
            <span className="text-xs font-bold text-[#2457D6]">
              {match.filledSlots} / {match.totalSlots} Slots Filled
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#F7F7F2] rounded-full h-2 overflow-hidden border border-[#E6E8EC]">
            <div 
              className="bg-[#2457D6] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (match.filledSlots / match.totalSlots) * 100)}%` }}
            />
          </div>

          {/* Accepted Players Roster List */}
          <div className="pt-2">
            <p className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider mb-3">Confirmed Participants</p>
            <div className="flex flex-wrap items-center gap-3">
              {/* Host avatar */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F7F2] border border-[#2457D6]/30 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-[#2457D6] text-white font-bold text-xs flex items-center justify-center">
                  {match.host?.profile?.name?.[0]?.toUpperCase() || 'H'}
                </div>
                <span className="text-xs font-bold text-[#172033]">{match.host?.profile?.name || 'Host'}</span>
                <span className="text-[10px] font-bold text-[#2457D6] bg-[#2457D6]/10 px-1.5 py-0.5 rounded">HOST</span>
              </div>

              {/* Accepted Players */}
              {acceptedRequests.map((req: any) => (
                <div key={req.id} className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#E6E8EC] text-[#172033] font-bold text-xs flex items-center justify-center">
                    {req.user?.profile?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <span className="text-xs font-semibold text-[#172033]">{req.user?.profile?.name || req.user?.email?.split('@')[0]}</span>
                </div>
              ))}

              {match.totalSlots - match.filledSlots > 0 && (
                <span className="text-xs font-semibold text-[#98A2B3] italic py-1.5">
                  + {match.totalSlots - match.filledSlots} open spots available
                </span>
              )}
            </div>
          </div>
        </section>

        {/* About Game Description */}
        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-[#172033]">About Game & Rules</h2>
          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 text-sm text-[#172033] leading-relaxed shadow-sm">
            {match.description || 'No additional match details provided by host.'}
          </div>
        </section>

        {/* Interactive Location Map */}
        {match.latitude && match.longitude && (
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#172033]">Venue Location Pin</h2>
            <div className="border border-[#E6E8EC] rounded-xl overflow-hidden h-64 shadow-sm">
              <MapboxPicker initialLat={match.latitude} initialLng={match.longitude} readOnly={true} />
            </div>
          </section>
        )}

        {/* Security Note */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E6E8EC] text-xs text-[#667085] flex items-center gap-2.5 shadow-sm">
          <Shield className="w-4 h-4 text-[#2457D6] shrink-0" />
          <span>Hosts manage request approvals to ensure fair team compositions and player attendance.</span>
        </div>
      </main>

      {/* Sticky Bottom Bar Action Bar (offset for mobile nav) */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E6E8EC] backdrop-blur-md p-3.5 sm:p-5 shadow-lg">

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#667085]">Match Entry Fee</p>
            <p className="text-xl font-black text-[#172033]">
              {match.pricePerHead === 0 || !match.pricePerHead ? 'Free' : `₹${match.pricePerHead}`}
              <span className="text-xs text-[#98A2B3] font-normal ml-1">/ player</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isHost ? (
              <Link
                to={`/manage/${match.id}`}
                className="px-6 py-3 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow-sm transition-colors uppercase tracking-wider flex items-center gap-2"
              >
                Manage Requests
              </Link>
            ) : requestStatus === 'ACCEPTED' ? (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2.5 bg-[#16803C]/10 border border-[#16803C]/20 text-[#16803C] text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> You're In!
                </span>
                <Link
                  to="/messages"
                  className="px-4 py-2.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Match Chat
                </Link>
              </div>
            ) : requestStatus === 'PENDING' ? (
              <button
                onClick={handleWithdrawRequest}
                disabled={requesting}
                className="px-5 py-2.5 bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] hover:bg-[#D97706]/20 font-bold text-xs rounded-xl transition"
              >
                {requesting ? 'Updating...' : 'Pending (Withdraw)'}
              </button>
            ) : isMatchPassed ? (
              <button disabled className="px-6 py-3 bg-[#F7F7F2] border border-[#E6E8EC] text-[#98A2B3] font-bold text-xs rounded-xl cursor-not-allowed uppercase">
                Match Passed
              </button>
            ) : isMatchFull ? (
              <button disabled className="px-6 py-3 bg-[#F7F7F2] border border-[#E6E8EC] text-[#98A2B3] font-bold text-xs rounded-xl cursor-not-allowed uppercase">
                Match Full
              </button>
            ) : (
              <button
                onClick={handleRequestJoin}
                disabled={requesting}
                className="px-6 py-3 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                {requesting ? 'Sending...' : 'Request to Join Game'}
              </button>
            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
