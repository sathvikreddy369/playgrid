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
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-24 sm:pb-12">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-sm font-bold text-white">Player Profile</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner">
              {getAvatarEmoji(profile.avatarId)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              <p className="text-xs text-zinc-400 max-w-md line-clamp-2 mt-0.5">
                {profile.bio || 'No bio added.'}
              </p>
            </div>
          </div>

          {/* Reliability Score */}
          {(() => {
            const scoreInfo = formatReliabilityScore(profile.attendedGames, profile.missedGames, profile.reliabilityScore);
            return (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-center min-w-[140px]">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">PlayGrid Score</p>
                <p className="text-2xl font-extrabold text-indigo-400 mt-0.5">{scoreInfo.label}</p>
                <p className="text-[10px] text-zinc-500 font-medium">{scoreInfo.status}</p>
              </div>
            );
          })()}

        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-1">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white">{profile.attendedGames}</p>
            <p className="text-xs text-zinc-400 font-medium">Attended</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white">{profile.missedGames}</p>
            <p className="text-xs text-zinc-400 font-medium">Missed</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-1">
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white">{profile.hostedGames}</p>
            <p className="text-xs text-zinc-400 font-medium">Hosted</p>
          </div>
        </section>

        {/* Physical Sports & E-Sports Interests */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">⚽ Physical Sports</h3>
            <div className="flex flex-wrap gap-2">
              {profile.physicalSports?.length > 0 ? (
                profile.physicalSports.map((s: string) => (
                  <span key={s} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500 italic">No physical sports listed</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">🎮 E-Sports & Gaming</h3>
            <div className="flex flex-wrap gap-2">
              {profile.eSports?.length > 0 ? (
                profile.eSports.map((g: string) => (
                  <span key={g} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold">
                    {g}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500 italic">No e-sports listed</span>
              )}
            </div>
          </div>
        </section>

        {/* Action Button */}
        {!isOwnProfile && (
          <section className="pt-2">
            {profile.allowMessageRequests === false ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
                This user isn't accepting new message requests right now.
              </div>
            ) : messageRequestStatus === 'ACCEPTED' ? (
              <Link
                to="/messages"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare className="w-4 h-4" /> Open Chat Conversation
              </Link>
            ) : messageRequestStatus === 'PENDING' || messageSentSuccess ? (
              <div className="w-full py-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm rounded-xl flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Message Request Pending Approval
              </div>
            ) : (
              <button
                onClick={handleSendAreaMessageRequest}
                disabled={requestingMsg}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01]"
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
