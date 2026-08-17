import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, MapPin, Users, CheckCircle2, Link2 } from 'lucide-react';

import { api } from '../api';
import MapboxPicker from '../components/MapboxPicker';
import MobileNav from '../components/MobileNav';
import { ESPORTS_PRESETS, PHYSICAL_SPORTS_PRESETS } from '../constants/sportsPresets';

export default function CreateMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Match Type: PHYSICAL vs E_GAME
  const [matchType, setMatchType] = useState<'PHYSICAL' | 'E_GAME'>('PHYSICAL');

  // Common Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [totalSlots, setTotalSlots] = useState('10');
  const [pricePerHead, setPricePerHead] = useState('0');

  // Physical Fields
  const [sport, setSport] = useState('Cricket');
  const [locationText, setLocationText] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // E-Game Fields
  const [eGameName, setEGameName] = useState('BGMI');
  const [eGameMode, setEGameMode] = useState('Squad');
  const [ePlatform, setEPlatform] = useState('Mobile');
  const [roomCode, setRoomCode] = useState('');

  // Extract lat/lng from pasted Google Maps link
  const handleMapLinkChange = (val: string) => {
    setMapLink(val);
    const parsed = val.match(/@?(-?\d+\.\d+),\s*(-?\d+\.\d+)/) || val.match(/q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (parsed && parsed[1] && parsed[2]) {
      const lat = parseFloat(parsed[1]);
      const lng = parseFloat(parsed[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoords({ lat, lng });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!date || !time) {
        setError('Please select both match date and start time.');
        setLoading(false);
        return;
      }

      const dateTimeObj = new Date(`${date}T${time}:00`);
      if (isNaN(dateTimeObj.getTime())) {
        setError('Invalid match date or time selected.');
        setLoading(false);
        return;
      }

      await api.post('/matches', {
        title,
        description,
        matchType,
        eGameName: matchType === 'E_GAME' ? eGameName : undefined,
        eGameMode: matchType === 'E_GAME' ? eGameMode : undefined,
        ePlatform: matchType === 'E_GAME' ? ePlatform : undefined,
        roomCode: matchType === 'E_GAME' ? roomCode : undefined,
        isOnline: matchType === 'E_GAME',
        locationText: matchType === 'PHYSICAL' ? (locationText || 'Hyderabad') : 'Online Custom Room',
        mapLink: matchType === 'PHYSICAL' ? mapLink : undefined,
        latitude: matchType === 'PHYSICAL' ? (coords?.lat ?? null) : null,
        longitude: matchType === 'PHYSICAL' ? (coords?.lng ?? null) : null,
        date: dateTimeObj.toISOString(),
        totalSlots: parseInt(totalSlots, 10) || 10,
        pricePerHead: parseFloat(pricePerHead) || 0,
        tags: matchType === 'PHYSICAL' ? [sport] : [eGameName, 'Gaming']
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to create match', err);
      setError(err?.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-24 sm:pb-12">
      {/* Header */}
      <header className="border-b border-[#E6E8EC] bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#667085] hover:text-[#172033] transition uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
          <span className="text-sm font-black text-[#172033] uppercase tracking-wider">Host a Game</span>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Section 1: Choose Game Category */}
          <section className="bg-white border border-[#E6E8EC] rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E6E8EC]">
              <Trophy className="w-4 h-4 text-[#2457D6]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#172033]">1. Game Category & Details</h2>
            </div>

            {/* Selector: Physical vs E-Game */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMatchType('PHYSICAL')}
                className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                  matchType === 'PHYSICAL'
                    ? 'bg-[#2457D6] border-[#2457D6] text-white shadow-sm'
                    : 'bg-white border-[#E6E8EC] text-[#667085] hover:border-[#2457D6]/50 hover:text-[#172033]'
                }`}
              >
                ⚽ Physical Sport
              </button>

              <button
                type="button"
                onClick={() => setMatchType('E_GAME')}
                className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                  matchType === 'E_GAME'
                    ? 'bg-[#2457D6] border-[#2457D6] text-white shadow-sm'
                    : 'bg-white border-[#E6E8EC] text-[#667085] hover:border-[#2457D6]/50 hover:text-[#172033]'
                }`}
              >
                🎮 E-Sports & Gaming
              </button>
            </div>

            {/* Match Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#667085]">Match / Tournament Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={matchType === 'PHYSICAL' ? 'e.g. Sunday Box Cricket Championship' : 'e.g. BGMI Squad Custom Room Challenge'}
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6]"
              />
            </div>

            {/* Conditional Selection Fields */}
            {matchType === 'PHYSICAL' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Select Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6] font-semibold"
                >
                  {PHYSICAL_SPORTS_PRESETS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#667085]">Select Game</label>
                  <select
                    value={eGameName}
                    onChange={(e) => setEGameName(e.target.value)}
                    className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6] font-semibold"
                  >
                    {ESPORTS_PRESETS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#667085]">Game Mode</label>
                  <select
                    value={eGameMode}
                    onChange={(e) => setEGameMode(e.target.value)}
                    className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6] font-semibold"
                  >
                    <option value="Squad">Squad</option>
                    <option value="Duo">Duo</option>
                    <option value="Solo">Solo</option>
                    <option value="5v5">5v5 TDM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#667085]">Platform</label>
                  <select
                    value={ePlatform}
                    onChange={(e) => setEPlatform(e.target.value)}
                    className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6] font-semibold"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="PC">PC</option>
                    <option value="Console">Console</option>
                    <option value="Cross-Platform">Cross-Platform</option>
                  </select>
                </div>
              </div>
            )}

            {/* Room Code (Optional for E-Games) */}
            {matchType === 'E_GAME' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Custom Room Code / Passcode (Optional)</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="e.g. Room ID: 884920, Pass: 1234"
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6]"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#667085]">Description & Rules</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe rules, reporting time, and gear required..."
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6]"
              />
            </div>
          </section>

          {/* Section 2: Date & Time */}
          <section className="bg-white border border-[#E6E8EC] rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E6E8EC]">
              <Calendar className="w-4 h-4 text-[#2457D6]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#172033]">2. Schedule Date & Time</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Match Date</label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Start Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6]"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Venue (Only for Physical) */}
          {matchType === 'PHYSICAL' && (
            <section className="bg-white border border-[#E6E8EC] rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E6E8EC]">
                <MapPin className="w-4 h-4 text-[#2457D6]" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#172033]">3. Venue Location</h2>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Venue Name / Area</label>
                <input
                  type="text"
                  required
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g. SkyTurf Gachibowli, Hyderabad"
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6]"
                />
              </div>

              {/* Google Maps Link / Coordinates Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085] flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#2457D6]" />
                  Google Maps Link or Coordinates (Optional)
                </label>
                <input
                  type="text"
                  value={mapLink}
                  onChange={(e) => handleMapLinkChange(e.target.value)}
                  placeholder="Paste Google Maps URL or coordinates (e.g. https://maps.google.com/?q=17.4401,78.3489)"
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6]"
                />
                {coords && (
                  <p className="text-[11px] text-[#16803C] font-bold mt-1">
                    ✓ Pin Coordinates Set: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Or Select Location on Interactive Map</label>
                <div className="border border-[#E6E8EC] rounded-xl overflow-hidden h-52">
                  <MapboxPicker onLocationSelect={(lat, lng) => setCoords({ lat, lng })} readOnly={false} />
                </div>
              </div>
            </section>
          )}

          {/* Section 4: Slots & Pricing */}
          <section className="bg-white border border-[#E6E8EC] rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E6E8EC]">
              <Users className="w-4 h-4 text-[#2457D6]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#172033]">
                {matchType === 'PHYSICAL' ? '4. Slots & Pricing' : '3. Room Capacity & Entry Fee'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Total Available Slots</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  required
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6] font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#667085]">Price per Head (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={pricePerHead}
                  onChange={(e) => setPricePerHead(e.target.value)}
                  placeholder="0 for free match"
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3.5 text-sm text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] font-semibold"
                />
              </div>
            </div>
          </section>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Host Game Now
              </>
            )}
          </button>

        </form>
      </main>

      <MobileNav />
    </div>
  );
}
