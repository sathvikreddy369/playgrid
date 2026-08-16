import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'framer-motion';
import MapboxPicker from '../components/MapboxPicker';
import { Camera, Save, User, MapPin } from 'lucide-react';
import { api } from '../api';
import { useEffect } from 'react';

export default function UserProfile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [sportInput, setSportInput] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [riotId, setRiotId] = useState('');
  const [steamId, setSteamId] = useState('');
  const [discordId, setDiscordId] = useState('');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data.profile) {
          const p = res.data.profile;
          setName(p.name || '');
          setBio(p.bio || '');
          setAge(p.age ? p.age.toString() : '');
          setGender(p.gender || 'Prefer not to say');
          if (p.latitude && p.longitude) setLocation({ lat: p.latitude, lng: p.longitude });
          setFavoriteSports(p.favoriteSports || []);
          setLevel(p.levels?.[0] || 'Beginner');
          setRiotId(p.riotId || '');
          setSteamId(p.steamId || '');
          setDiscordId(p.discordId || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleAddSport = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sportInput.trim()) {
      e.preventDefault();
      if (!favoriteSports.includes(sportInput.trim())) {
        setFavoriteSports([...favoriteSports, sportInput.trim()]);
      }
      setSportInput('');
    }
  };

  const removeSport = (sport: string) => {
    setFavoriteSports(favoriteSports.filter(s => s !== sport));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.post('/users/profile', {
        name,
        bio,
        age: age ? parseInt(age) : null,
        gender,
        latitude: location?.lat,
        longitude: location?.lng,
        favoriteSports,
        levels: [level],
        riotId,
        steamId,
        discordId
      });
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to save profile', err);
      alert('Failed to save profile');
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
    <div className="min-h-screen bg-zinc-950 text-white p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header Banner */}
          <div className="h-32 lg:h-48 bg-gradient-to-r from-blue-600/40 to-purple-600/40 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                <User className="w-10 h-10 text-zinc-500" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-8 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Personal Info
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-400 ml-1">Age</label>
                      <input 
                        type="number" 
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 ml-1">Gender</label>
                      <select 
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none appearance-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-400 ml-1">Bio</label>
                    <textarea 
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none resize-none"
                      placeholder="Tell others about yourself..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  Location
                </h2>
                <div className="mb-2">
                  <button type="button" className="text-xs text-blue-400 hover:text-blue-300">
                    Use my current location
                  </button>
                </div>
                <MapboxPicker onLocationSelect={(lat, lng) => setLocation({lat, lng})} />
                {location && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Sports & Gaming</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 ml-1">Favorite Sports / Games (Press Enter to add)</label>
                    <input 
                      type="text" 
                      value={sportInput}
                      onChange={e => setSportInput(e.target.value)}
                      onKeyDown={handleAddSport}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                      placeholder="e.g. Cricket, BGMI, Football"
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {favoriteSports.map(sport => (
                        <span key={sport} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs flex items-center gap-1">
                          {sport}
                          <button type="button" onClick={() => removeSport(sport)} className="hover:text-white">&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-zinc-400 ml-1">Skill Level</label>
                    <select 
                      value={level}
                      onChange={e => setLevel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none appearance-none"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Pro / Esports</option>
                    </select>
                  </div>

                  {level === 'Pro / Esports' && (
                    <div className="pt-4 space-y-4 border-t border-zinc-800">
                      <h3 className="text-sm font-bold text-zinc-300">Esports Identifiers</h3>
                      
                      <div>
                        <label className="text-xs font-medium text-zinc-400 ml-1">Riot ID</label>
                        <input 
                          type="text" 
                          value={riotId}
                          onChange={e => setRiotId(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500/50 outline-none"
                          placeholder="Player#NA1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400 ml-1">Steam ID</label>
                        <input 
                          type="text" 
                          value={steamId}
                          onChange={e => setSteamId(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500/50 outline-none"
                          placeholder="STEAM_0:1:12345678"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400 ml-1">Discord Tag</label>
                        <input 
                          type="text" 
                          value={discordId}
                          onChange={e => setDiscordId(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500/50 outline-none"
                          placeholder="player#1234"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
