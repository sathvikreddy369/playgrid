import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Trophy, Plus, MessageSquare, LogOut, Navigation, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';
import NotificationBell from '../components/NotificationBell';
import MobileNav from '../components/MobileNav';

export default function Dashboard() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [matchTypeFilter, setMatchTypeFilter] = useState<'ALL' | 'PHYSICAL' | 'E_GAME'>('ALL');
  const [sportFilter, setSportFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState<'soonest' | 'price_low' | 'price_high'>('soonest');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Nearby Location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(10);
  const [locationDenied, setLocationDenied] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Request browser location
  const handleFindNearby = useCallback(() => {
    setIsLocating(true);
    setLocationDenied(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setMatchTypeFilter('PHYSICAL');
          setPage(1);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation permission denied or error', err);
          setLocationDenied(true);
          setIsLocating(false);
        }
      );
    } else {
      setLocationDenied(true);
      setIsLocating(false);
    }
  }, []);

  // Fetch matches from API with query params
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const params: any = {
          page,
          limit: 12,
          type: matchTypeFilter !== 'ALL' ? matchTypeFilter : undefined,
          sport: sportFilter !== 'ALL' ? sportFilter : undefined,
          search: debouncedSearch || undefined,
          sort: sortOption
        };

        if (userLocation && matchTypeFilter === 'PHYSICAL') {
          params.latitude = userLocation.lat;
          params.longitude = userLocation.lng;
          params.radius = radius;
        }

        const [profileRes, matchesRes] = await Promise.all([
          api.get('/users/profile').catch(() => null),
          api.get('/matches', { params }).catch(() => null)
        ]);

        if (profileRes?.data?.profile) setProfile(profileRes.data.profile);
        if (matchesRes?.data) {
          setMatches(matchesRes.data.matches || []);
          setHasMore(matchesRes.data.hasMore || false);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [debouncedSearch, matchTypeFilter, sportFilter, sortOption, page, userLocation, radius]);

  const sportsList = ['ALL', 'Cricket', 'Football', 'Badminton', 'BGMI', 'Free Fire', 'Valorant', 'Gaming', 'Basketball'];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-24 sm:pb-12">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Playgrid
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link to="/messages" className="p-2 text-zinc-400 hover:text-white transition">
              <MessageSquare className="w-5 h-5" />
            </Link>
            <Link to="/profile" className="hidden sm:block text-xs font-semibold text-zinc-400 hover:text-white transition">
              Profile
            </Link>
            <button onClick={signOut} className="p-2 text-zinc-400 hover:text-red-400 transition" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
            <Link 
              to="/create-match" 
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Host Game
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good evening, {profile?.name || 'Player'} 👋
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Find sports games and custom e-sports rooms across Hyderabad.</p>
          </div>

          <Link
            to="/create-match"
            className="sm:hidden w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Host a New Game
          </Link>
        </section>

        {/* Category Tabs: Physical vs E-Games vs Nearby */}
        <section className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/50 border border-zinc-800/80 p-2 rounded-2xl">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { setMatchTypeFilter('ALL'); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                matchTypeFilter === 'ALL' && !userLocation
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => { setMatchTypeFilter('PHYSICAL'); setUserLocation(null); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                matchTypeFilter === 'PHYSICAL' && !userLocation
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⚽ Physical Sports
            </button>
            <button
              onClick={() => { setMatchTypeFilter('E_GAME'); setUserLocation(null); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                matchTypeFilter === 'E_GAME'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🎮 E-Sports & Gaming
            </button>
          </div>

          {/* Nearby Action Button & Radius Selector */}
          <div className="flex items-center gap-2">
            {userLocation && (
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {[2, 5, 10, 25].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      radius === r ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handleFindNearby}
              disabled={isLocating}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                userLocation
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              {isLocating ? 'Locating...' : userLocation ? '📍 Nearby Active' : 'Find Nearby'}
            </button>
          </div>
        </section>


        {/* Location Denied Banner */}
        {locationDenied && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center justify-between">
            <span>Location access is disabled in browser. Search by area below (e.g., Gachibowli, Madhapur):</span>
            <div className="flex gap-2">
              {['Gachibowli', 'Madhapur', 'Kondapur'].map((area) => (
                <button
                  key={area}
                  onClick={() => setSearch(area)}
                  className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-bold"
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar & Sort Dropdown */}
        <section className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matches, sports or areas in Hyderabad..."
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-zinc-500 shrink-0" />
            <select
              value={sortOption}
              onChange={(e: any) => setSortOption(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            >
              <option value="soonest">Sort: Soonest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </section>

        {/* Sport Selector Pills */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sportsList.map((sport) => (
            <button
              key={sport}
              onClick={() => { setSportFilter(sport); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                sportFilter === sport
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {sport}
            </button>
          ))}
        </section>

        {/* Matches Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-white">
              Available Matches ({matches.length})
            </h2>
            <span className="text-xs text-zinc-500 font-medium">Page {page}</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-zinc-500 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              Loading games...
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
              <Trophy className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-zinc-300">No games found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No active matches matched your criteria. Try clearing search filters or create the first game!
              </p>
              <Link to="/create-match" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow">
                Host a Match
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m) => {
                const isEGame = m.matchType === 'E_GAME';
                const filledRatio = Math.min(100, (m.filledSlots / m.totalSlots) * 100);
                const isPassed = new Date(m.date) < new Date();
                const isFull = m.filledSlots >= m.totalSlots;

                return (
                  <div
                    key={m.id}
                    className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Badge Top Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            isEGame 
                              ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
                              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                          }`}>
                            {isEGame ? `🎮 ${m.eGameName || 'E-GAME'}` : `#${m.tags?.[0] || 'sport'}`}
                          </span>
                          {isEGame && m.eGameMode && (
                            <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] font-semibold text-zinc-400 rounded">
                              {m.eGameMode}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          {m.pricePerHead === 0 || !m.pricePerHead ? 'Free' : `₹${m.pricePerHead}`}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {m.title}
                      </h3>

                      {/* Date & Location Metadata */}
                      <div className="space-y-1.5 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>
                            {new Date(m.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{m.locationText || 'Online / Custom Room'}</span>
                        </div>
                      </div>
                    </div>

                    {/* People Roster & Slot Progress */}
                    <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                      {/* Host & Player Count */}
                      <div className="flex items-center justify-between text-xs">
                        <Link 
                          to={`/profile/${m.hostId}`} 
                          className="flex items-center gap-2 hover:underline"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {m.host?.profile?.name?.[0]?.toUpperCase() || 'H'}
                          </div>
                          <span className="text-zinc-300 font-medium">{m.host?.profile?.name || 'Host'}</span>
                        </Link>

                        <span className={`font-bold ${isFull ? 'text-amber-400' : 'text-indigo-400'}`}>
                          {m.filledSlots} / {m.totalSlots} Slots
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isEGame ? 'bg-purple-500' : 'bg-indigo-500'}`}
                          style={{ width: `${filledRatio}%` }}
                        />
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {isPassed ? 'Game Passed' : isFull ? 'Full Capacity' : `${m.totalSlots - m.filledSlots} spots left`}
                        </span>

                        <Link
                          to={`/match/${m.id}`}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          View Game →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold rounded-lg text-zinc-300 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs font-bold text-zinc-500">Page {page}</span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold rounded-lg text-zinc-300 disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
