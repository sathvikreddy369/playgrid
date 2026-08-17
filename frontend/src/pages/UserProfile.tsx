import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Trophy, Save, CheckCircle, Calendar, AlertTriangle, LogOut } from 'lucide-react';

import { api } from '../api';
import AvatarSelector from '../components/AvatarSelector';
import InterestPresets from '../components/InterestPresets';
import MobileNav from '../components/MobileNav';
import { getAvatarEmoji, formatReliabilityScore } from '../constants/sportsPresets';


export default function UserProfile() {
  const { user, signOut } = useAuth();
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
      <div className="min-h-screen bg-[#F7F7F2] text-[#172033] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-24 sm:pb-12">
      {/* Header */}
      <header className="border-b border-[#E6E8EC] bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-black text-[#172033] uppercase tracking-wider">Player Profile & Settings</span>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-semibold text-[#16803C] bg-[#16803C]/10 px-2.5 py-1 rounded-md border border-[#16803C]/20">
                ✓ Saved!
              </span>
            )}
            <button
              onClick={signOut}
              className="px-3 py-1.5 bg-[#DC2626]/10 border border-[#DC2626]/20 hover:bg-[#DC2626]/20 text-[#DC2626] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Profile Card Header */}
        <section className="bg-white border border-[#E6E8EC] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#F7F7F2] border border-[#E6E8EC] flex items-center justify-center text-3xl shadow-inner">
              {getAvatarEmoji(avatarId)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033] uppercase">{name || 'GAMEVIA Player'}</h1>
              <p className="text-xs text-[#667085] max-w-md line-clamp-2 mt-0.5">
                {bio || 'No bio added yet. Add a short bio to let other players know your favorite sports!'}
              </p>
            </div>
          </div>

          {/* Reliability Score Badge */}
          {(() => {
            const scoreInfo = formatReliabilityScore(attendedGames, missedGames, reliabilityScore);
            return (
              <div className="bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl px-5 py-3 text-center min-w-[140px]">
                <p className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">GAMEVIA Score</p>
                <p className="text-2xl font-black text-[#2457D6] mt-0.5">{scoreInfo.label}</p>
                <p className="text-[10px] text-[#667085] mt-0.5 font-semibold">{scoreInfo.status}</p>
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
            <p className="text-xl font-bold text-[#172033]">{attendedGames}</p>
            <p className="text-xs text-[#667085] font-semibold">Attended</p>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center mx-auto mb-1 border border-[#DC2626]/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-[#172033]">{missedGames}</p>
            <p className="text-xs text-[#667085] font-semibold">Missed</p>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-xl p-4 text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#2457D6]/10 text-[#2457D6] flex items-center justify-center mx-auto mb-1 border border-[#2457D6]/20">
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-[#172033]">{hostedGames}</p>
            <p className="text-xs text-[#667085] font-semibold">Hosted</p>
          </div>
        </section>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="bg-white border border-[#E6E8EC] rounded-xl p-6 space-y-6 shadow-sm">
          <h2 className="text-base font-extrabold text-[#172033] uppercase tracking-wider">Edit Profile & Interests</h2>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#667085]">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sathvik Reddy"
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6]"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#667085]">Bio / About You</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Weekend cricket player. Usually around Gachibowli. Always up for a good game!"
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6]"
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
            <div className="pt-2 border-t border-[#E6E8EC] flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#172033]">Allow Direct Message Requests</p>
                <p className="text-xs text-[#667085]">Let other players send you message requests before starting a chat.</p>
              </div>
              <input
                type="checkbox"
                checked={allowMessageRequests}
                onChange={(e) => setAllowMessageRequests(e.target.checked)}
                className="w-5 h-5 accent-[#2457D6] rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#2457D6] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors uppercase tracking-wider disabled:opacity-50"
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
            <h2 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2457D6]" />
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
                      ? 'bg-[#2457D6] text-white shadow-sm'
                      : 'bg-white border border-[#E6E8EC] text-[#667085] hover:text-[#172033]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {historyItems.length === 0 ? (
            <div className="bg-white border border-[#E6E8EC] rounded-xl p-8 text-center text-[#98A2B3] text-xs shadow-sm">
              No game history records found for this filter.
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => {
                const isHostedTab = historyFilter === 'HOSTED';
                const matchData = isHostedTab ? item : item.match;
                if (!matchData) return null;

                return (
                  <div key={item.id} className="bg-white border border-[#E6E8EC] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="font-bold text-sm text-[#172033]">{matchData.title}</h4>
                      <p className="text-xs text-[#667085] mt-0.5">
                        {new Date(matchData.date).toLocaleDateString()} • {matchData.locationText || 'Hyderabad'}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      isHostedTab 
                        ? 'bg-[#2457D6]/10 text-[#2457D6] border border-[#2457D6]/20'
                        : item.status === 'ATTENDED'
                        ? 'bg-[#16803C]/10 text-[#16803C] border border-[#16803C]/20'
                        : 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20'
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
