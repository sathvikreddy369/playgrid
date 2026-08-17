import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Trophy, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';
import { getAvatarEmoji, formatReliabilityScore } from '../constants/sportsPresets';
import MobileNav from '../components/MobileNav';


export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [messageRequestStatus, setMessageRequestStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingMsg, setRequestingMsg] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/public/${id}`);
        setProfile(res.data.profile);
        setMessageRequestStatus(res.data.messageRequestStatus);
      } catch (err) {
        console.error('Failed to fetch public profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPublicProfile();
  }, [id]);

  const handleSendAreaMessageRequest = async () => {
    if (!id || !user) return;
    setRequestingMsg(true);
    try {
      await api.post('/users/message-requests', { receiverId: id });
      setMessageRequestStatus('PENDING');
      setMessageSentSuccess(true);
    } catch (err: any) {
      console.error('Failed to send message request', err);
      alert(err.response?.data?.error || 'Failed to send message request');
    } finally {
      setRequestingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-zinc-300 mb-2">User Profile Not Found</h2>
        <Link to="/dashboard" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.userId;

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-24 sm:pb-12">
      {/* Header */}
      <header className="border-b border-[#E6E8EC] bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#667085] hover:text-[#172033] transition uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-sm font-black text-[#172033] uppercase tracking-wider">Player Profile</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <section className="bg-white border border-[#E6E8EC] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#F7F7F2] border border-[#E6E8EC] flex items-center justify-center text-3xl shadow-inner">
              {getAvatarEmoji(profile.avatarId)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033] uppercase">{profile.name}</h1>
              <p className="text-xs text-[#667085] max-w-md line-clamp-2 mt-0.5">
                {profile.bio || 'No bio added.'}
              </p>
            </div>
          </div>

          {/* Reliability Score */}
          {(() => {
            const scoreInfo = formatReliabilityScore(profile.attendedGames, profile.missedGames, profile.reliabilityScore);
            return (
              <div className="bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl px-5 py-3 text-center min-w-[140px]">
                <p className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">GAMEVIA Score</p>
                <p className="text-2xl font-black text-[#2457D6] mt-0.5">{scoreInfo.label}</p>
                <p className="text-[10px] text-[#667085] font-semibold">{scoreInfo.status}</p>
              </div>
            );
          })()}

        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#16803C]/10 text-[#16803C] flex items-center justify-center mx-auto mb-1 border border-[#16803C]/20">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-[#172033]">{profile.attendedGames}</p>
            <p className="text-xs text-[#667085] font-semibold">Attended</p>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center mx-auto mb-1 border border-[#DC2626]/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-[#172033]">{profile.missedGames}</p>
            <p className="text-xs text-[#667085] font-semibold">Missed</p>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#2457D6]/10 text-[#2457D6] flex items-center justify-center mx-auto mb-1 border border-[#2457D6]/20">
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-[#172033]">{profile.hostedGames}</p>
            <p className="text-xs text-[#667085] font-semibold">Hosted</p>
          </div>
        </section>

        {/* Physical Sports & E-Sports Interests */}
        <section className="bg-white border border-[#E6E8EC] rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider mb-2">⚽ Physical Sports</h3>
            <div className="flex flex-wrap gap-2">
              {profile.physicalSports?.length > 0 ? (
                profile.physicalSports.map((s: string) => (
                  <span key={s} className="px-3 py-1 bg-[#2457D6]/10 border border-[#2457D6]/20 text-[#2457D6] rounded-xl text-xs font-bold uppercase">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#98A2B3] italic">No physical sports listed</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6E8EC]">
            <h3 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider mb-2">🎮 E-Sports & Gaming</h3>
            <div className="flex flex-wrap gap-2">
              {profile.eSports?.length > 0 ? (
                profile.eSports.map((g: string) => (
                  <span key={g} className="px-3 py-1 bg-[#2457D6]/10 border border-[#2457D6]/20 text-[#2457D6] rounded-xl text-xs font-bold uppercase">
                    {g}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#98A2B3] italic">No e-sports listed</span>
              )}
            </div>
          </div>
        </section>

        {/* Action Button */}
        {!isOwnProfile && (
          <section className="pt-2">
            {profile.allowMessageRequests === false ? (
              <div className="p-4 rounded-xl bg-white border border-[#E6E8EC] text-center text-xs text-[#98A2B3] shadow-sm">
                This user isn't accepting new message requests right now.
              </div>
            ) : messageRequestStatus === 'ACCEPTED' ? (
              <Link
                to="/messages"
                className="w-full py-3.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4" /> Open Chat Conversation
              </Link>
            ) : messageRequestStatus === 'PENDING' || messageSentSuccess ? (
              <div className="w-full py-3.5 bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] font-bold text-sm rounded-xl flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Message Request Pending Approval
              </div>
            ) : (
              <button
                onClick={handleSendAreaMessageRequest}
                disabled={requestingMsg}
                className="w-full py-3.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" /> Send Message Request
              </button>
            )}
          </section>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
