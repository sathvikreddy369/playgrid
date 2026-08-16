import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Trophy, Save, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';

import { api } from '../api';
import AvatarSelector from '../components/AvatarSelector';
import InterestPresets from '../components/InterestPresets';
import MobileNav from '../components/MobileNav';
import { getAvatarEmoji, formatReliabilityScore } from '../constants/sportsPresets';


export default function UserProfile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarId, setAvatarId] = useState('avatar_01');
  const [allowMessageRequests, setAllowMessageRequests] = useState(true);
  const [physicalSports, setPhysicalSports] = useState<string[]>([]);
  const [eSports, setESports] = useState<string[]>([]);

  // Statistics
  const [reliabilityScore, setReliabilityScore] = useState(100);
  const [attendedGames, setAttendedGames] = useState(0);
  const [missedGames, setMissedGames] = useState(0);
  const [hostedGames, setHostedGames] = useState(0);

  // History tab
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'ATTENDED' | 'MISSED' | 'HOSTED'>('ALL');
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, historyRes] = await Promise.all([
          api.get('/users/profile').catch(() => null),
          api.get(`/users/history?filter=${historyFilter}`).catch(() => null)
        ]);

        if (profileRes?.data?.profile) {
          const p = profileRes.data.profile;
          setName(p.name || '');
          setBio(p.bio || '');
          setAvatarId(p.avatarId || 'avatar_01');
          setAllowMessageRequests(p.allowMessageRequests !== false);
          setPhysicalSports(p.physicalSports || []);
          setESports(p.eSports || []);
          setReliabilityScore(p.reliabilityScore ?? 100);
          setAttendedGames(p.attendedGames ?? 0);
          setMissedGames(p.missedGames ?? 0);
          setHostedGames(p.hostedGames ?? 0);
        }

        if (historyRes?.data) {
          if (historyFilter === 'HOSTED') {
            setHistoryItems(historyRes.data.hostedMatches || []);
          } else {
            setHistoryItems(historyRes.data.attendances || []);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfileData();
  }, [user, historyFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await api.post('/users/profile', {
        name,
        bio,
        avatarId,
        allowMessageRequests,
        physicalSports,
        eSports
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-24 sm:pb-12">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-base font-bold text-white">Player Profile & Stats</span>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              ✓ Saved!
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Profile Card Header */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner">
              {getAvatarEmoji(avatarId)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{name || 'PlayGrid Player'}</h1>
              <p className="text-xs text-zinc-400 max-w-md line-clamp-2 mt-0.5">
                {bio || 'No bio added yet. Add a short bio to let other players know your favorite sports!'}
              </p>
            </div>
          </div>

          {/* Reliability Score Badge */}
          {(() => {
            const scoreInfo = formatReliabilityScore(attendedGames, missedGames, reliabilityScore);
            return (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-center min-w-[140px]">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">PlayGrid Score</p>
                <p className="text-2xl font-extrabold text-indigo-400 mt-0.5">{scoreInfo.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">{scoreInfo.status}</p>
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
            <p className="text-xl font-bold text-white">{attendedGames}</p>
            <p className="text-xs text-zinc-400 font-medium">Attended</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white">{missedGames}</p>
            <p className="text-xs text-zinc-400 font-medium">Missed</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-1">
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white">{hostedGames}</p>
            <p className="text-xs text-zinc-400 font-medium">Hosted</p>
          </div>
        </section>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white">Edit Profile & Interests</h2>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sathvik Reddy"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Bio / About You</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Weekend cricket player. Usually around Gachibowli. Always up for a good game!"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Avatar Selector */}
            <AvatarSelector selectedAvatarId={avatarId} onSelectAvatar={(id) => setAvatarId(id)} />

            {/* Physical & E-Sports Interests */}
            <InterestPresets
              selectedPhysical={physicalSports}
              selectedEsports={eSports}
              onChangePhysical={setPhysicalSports}
              onChangeEsports={setESports}
            />

            {/* Message Request Toggle */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Allow Direct Message Requests</p>
                <p className="text-xs text-zinc-400">Let other players send you message requests before starting a chat.</p>
              </div>
              <input
                type="checkbox"
                checked={allowMessageRequests}
                onChange={(e) => setAllowMessageRequests(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile & Settings
              </>
            )}
          </button>
        </form>

        {/* Player Game History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Game History
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(['ALL', 'ATTENDED', 'MISSED', 'HOSTED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyFilter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {historyItems.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
              No game history records found for this filter.
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => {
                const isHostedTab = historyFilter === 'HOSTED';
                const matchData = isHostedTab ? item : item.match;
                if (!matchData) return null;

                return (
                  <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{matchData.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(matchData.date).toLocaleDateString()} • {matchData.locationText || 'Hyderabad'}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      isHostedTab 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : item.status === 'ATTENDED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {isHostedTab ? 'HOSTED' : item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
