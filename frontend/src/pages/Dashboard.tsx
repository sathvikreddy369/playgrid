import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Trophy, Plus, MessageSquare, Navigation, ArrowUpDown, ChevronLeft, ChevronRight, Star, PhoneCall } from 'lucide-react';
import { api } from '../api';
import NotificationBell from '../components/NotificationBell';
import MobileNav from '../components/MobileNav';
import NearbyMap, { type MapPoint } from '../components/NearbyMap';

export interface TurfOwnerVenue {
  id: string;
  name: string;
  category: 'Cricket Box' | 'Football Turf' | 'Badminton Court' | 'Swimming Pool' | 'Pickleball Court' | 'E-Sports Lounge';
  ownerName: string;
  ownerPhone: string;
  locationText: string;
  lat: number;
  lng: number;
  pricePerHour: number;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  imageUrl: string;
}

const MOCK_TURF_OWNERS: TurfOwnerVenue[] = [
  {
    id: 'turf-1',
    name: 'Skyline Box Cricket & Turf',
    category: 'Cricket Box',
    ownerName: 'Rajesh Sharma',
    ownerPhone: '+91 98765 43210',
    locationText: 'Gachibowli, Hyderabad',
    lat: 17.4401,
    lng: 78.3489,
    pricePerHour: 1200,
    rating: 4.9,
    reviewsCount: 124,
    amenities: ['Floodlights', 'Parking', 'Changing Room', 'Snack Bar'],
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'turf-2',
    name: 'KickOff Arena & Football Turf',
    category: 'Football Turf',
    ownerName: 'Karthik Reddy',
    ownerPhone: '+91 98123 45678',
    locationText: 'Madhapur, Hyderabad',
    lat: 17.4483,
    lng: 78.3915,
    pricePerHour: 1500,
    rating: 4.8,
    reviewsCount: 98,
    amenities: ['FIFA Grade Turf', 'Floodlights', 'Shower Room', 'Lockers'],
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'turf-3',
    name: 'SmashPro Badminton Complex',
    category: 'Badminton Court',
    ownerName: 'Vikram Verma',
    ownerPhone: '+91 99887 76655',
    locationText: 'Kondapur, Hyderabad',
    lat: 17.4622,
    lng: 78.3568,
    pricePerHour: 600,
    rating: 4.9,
    reviewsCount: 85,
    amenities: ['BWF Synthetic Floor', 'Air Conditioned', 'Equipment Rental'],
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'turf-4',
    name: 'BlueWave Aquatic Pool Center',
    category: 'Swimming Pool',
    ownerName: 'Ananya Rao',
    ownerPhone: '+91 97654 32109',
    locationText: 'Jubilee Hills, Hyderabad',
    lat: 17.4319,
    lng: 78.4071,
    pricePerHour: 350,
    rating: 4.9,
    reviewsCount: 142,
    amenities: ['Heated Pool', 'Life Guards', 'Lockers & Showers', 'Jacuzzi'],
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'turf-5',
    name: 'AcePoint Pickleball Club',
    category: 'Pickleball Court',
    ownerName: 'Suresh Patel',
    ownerPhone: '+91 91234 56789',
    locationText: 'HITEC City, Hyderabad',
    lat: 17.4435,
    lng: 78.3772,
    pricePerHour: 800,
    rating: 4.7,
    reviewsCount: 64,
    amenities: ['Pro Hard Courts', 'Paddle Rentals', 'Cafeteria', 'Night Lights'],
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'turf-6',
    name: 'CyberGrid E-Sports Arena',
    category: 'E-Sports Lounge',
    ownerName: 'Rohan Mehta',
    ownerPhone: '+91 93456 78901',
    locationText: 'Banjara Hills, Hyderabad',
    lat: 17.4156,
    lng: 78.4347,
    pricePerHour: 150,
    rating: 4.9,
    reviewsCount: 210,
    amenities: ['RTX 4090 PCs', 'PS5 120Hz Displays', 'Fiber Internet', 'Snack Bar'],
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  }
];

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab View: MATCHES | TURFS | MAP
  const [activeMainTab, setActiveMainTab] = useState<'MATCHES' | 'TURFS' | 'MAP'>('MATCHES');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [matchTypeFilter, setMatchTypeFilter] = useState<'ALL' | 'PHYSICAL' | 'E_GAME'>('ALL');
  const [sportFilter, setSportFilter] = useState('ALL');
  const [venueCategoryFilter, setVenueCategoryFilter] = useState<string>('ALL');
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
          setActiveMainTab('MAP');
          setPage(1);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation permission denied or error', err);
          setLocationDenied(true);
          setIsLocating(false);
          setActiveMainTab('MAP');
        }
      );
    } else {
      setLocationDenied(true);
      setIsLocating(false);
      setActiveMainTab('MAP');
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
  const venueCategories = ['ALL', 'Cricket Box', 'Football Turf', 'Badminton Court', 'Swimming Pool', 'Pickleball Court', 'E-Sports Lounge'];

  // Map Data Conversion
  const mapPoints: MapPoint[] = [
    ...matches.map(m => ({
      id: m.id,
      title: m.title,
      category: m.tags?.[0] || m.eGameName || 'Match',
      type: 'MATCH' as const,
      lat: m.latitude || 17.3968,
      lng: m.longitude || 78.4888,
      price: m.pricePerHead,
      locationText: m.locationText || 'Hyderabad',
      availableSlots: m.totalSlots - m.filledSlots,
      totalSlots: m.totalSlots
    })),
    ...MOCK_TURF_OWNERS.map(t => ({
      id: t.id,
      title: t.name,
      category: t.category,
      type: 'TURF' as const,
      lat: t.lat,
      lng: t.lng,
      price: t.pricePerHour,
      locationText: t.locationText,
      ownerName: t.ownerName,
      rating: t.rating
    }))
  ];

  const filteredTurfs = MOCK_TURF_OWNERS.filter(t => {
    const matchesCategory = venueCategoryFilter === 'ALL' || t.category === venueCategoryFilter;
    const matchesSearch = !debouncedSearch || 
      t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      t.locationText.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-24 sm:pb-12">
      {/* Top Navbar */}
      <nav className="border-b border-[#E6E8EC] bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2457D6] flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#2457D6] uppercase">
              GAMEVIA
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {(profile?.user?.role === 'ADMIN' || profile?.email === 'admin@gmail.com' || profile?.user?.email === 'admin@gmail.com') && (
              <Link to="/admin" className="px-3 py-1.5 bg-[#2457D6] hover:bg-[#1D4ED8] text-white font-black text-xs rounded-xl shadow-sm uppercase tracking-wider flex items-center gap-1">
                🛡️ Admin
              </Link>
            )}
            <NotificationBell />
            <Link to="/messages" className="hidden sm:block p-2 text-[#667085] hover:text-[#172033] transition-colors">
              <MessageSquare className="w-5 h-5" />
            </Link>
            <Link to="/profile" className="hidden sm:block text-xs font-bold text-[#667085] hover:text-[#172033] transition-colors uppercase tracking-wider">
              Profile
            </Link>
            <Link 
              to="/create-match" 
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow-sm transition-colors uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> Host Game
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6E8EC]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172033]">
              Welcome back, {profile?.name || 'Player'} 👋
            </h1>
            <p className="text-sm text-[#667085] mt-1">Discover active matches, book local turf venues, or host your own game.</p>
          </div>

          <Link
            to="/create-match"
            className="sm:hidden w-full py-3 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Host a New Game
          </Link>
        </section>

        {/* View Switcher Bar */}
        <section className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E6E8EC] p-2 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveMainTab('MATCHES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'MATCHES'
                  ? 'bg-[#2457D6] text-white shadow-sm'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              🔥 Active Matches ({matches.length})
            </button>
            <button
              onClick={() => setActiveMainTab('TURFS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'TURFS'
                  ? 'bg-[#2457D6] text-white shadow-sm'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              🏟️ Turf Owners & Venues ({MOCK_TURF_OWNERS.length})
            </button>
            <button
              onClick={() => setActiveMainTab('MAP')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'MAP'
                  ? 'bg-[#2457D6] text-white shadow-sm'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              📍 Nearby Map Radar
            </button>
          </div>

          {/* Nearby Location Button */}
          <div className="flex items-center gap-2">
            {userLocation && (
              <div className="flex items-center gap-1 bg-[#F7F7F2] p-1 rounded-lg border border-[#E6E8EC]">
                {[2, 5, 10, 25].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      radius === r ? 'bg-[#2457D6] text-white' : 'text-[#667085] hover:text-[#172033]'
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
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                userLocation
                  ? 'bg-[#16803C] text-white shadow-sm'
                  : 'bg-white border border-[#E6E8EC] text-[#172033] hover:bg-gray-50'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              {isLocating ? 'Locating...' : userLocation ? '📍 Nearby Active' : 'Find Nearby'}
            </button>
          </div>
        </section>

        {/* Location Denied Warning */}
        {locationDenied && (
          <div className="p-3.5 rounded-xl bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] text-xs flex items-center justify-between">
            <span>Location access disabled. Search by area in Hyderabad (e.g., Gachibowli, Madhapur):</span>
            <div className="flex gap-2">
              {['Gachibowli', 'Madhapur', 'Kondapur'].map((area) => (
                <button
                  key={area}
                  onClick={() => setSearch(area)}
                  className="px-2 py-0.5 bg-[#D97706]/20 hover:bg-[#D97706]/30 rounded text-[11px] font-bold text-[#172033]"
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Input Bar */}
        <section className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matches, sports, turf owners or locations..."
              className="w-full bg-white border border-[#E6E8EC] rounded-xl py-2.5 pl-11 pr-4 text-xs text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors"
            />
          </div>

          {activeMainTab === 'MATCHES' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-[#98A2B3] shrink-0" />
              <select
                value={sortOption}
                onChange={(e: any) => setSortOption(e.target.value)}
                className="bg-white border border-[#E6E8EC] rounded-xl py-2.5 px-3 text-xs text-[#172033] font-bold focus:outline-none focus:border-[#2457D6] w-full sm:w-auto"
              >
                <option value="soonest">Sort: Soonest First</option>
                {userLocation && <option value="nearest">Sort: Nearest First</option>}
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          )}
        </section>

        {/* MAP RADAR VIEW */}
        {activeMainTab === 'MAP' && (
          <section className="space-y-3">
            <NearbyMap userLocation={userLocation} items={mapPoints} radius={radius} />
          </section>
        )}

        {/* TURF OWNERS & VENUES VIEW */}
        {activeMainTab === 'TURFS' && (
          <section className="space-y-5">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {venueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVenueCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    venueCategoryFilter === cat
                      ? 'bg-[#2457D6] text-white shadow-sm'
                      : 'bg-white border border-[#E6E8EC] text-[#667085] hover:text-[#172033]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTurfs.map((turf) => (
                <div 
                  key={turf.id}
                  className="bg-white border border-[#E6E8EC] hover:border-[#2457D6]/50 rounded-2xl overflow-hidden shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                      <img 
                        src={turf.imageUrl} 
                        alt={turf.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#2457D6] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#E6E8EC]">
                        {turf.category}
                      </span>
                      <span className="absolute top-3 right-3 bg-[#172033]/80 backdrop-blur text-white text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {turf.rating} ({turf.reviewsCount})
                      </span>
                    </div>

                    {/* Venue Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-base text-[#172033] group-hover:text-[#2457D6] transition-colors">
                          {turf.name}
                        </h3>
                        <p className="text-xs text-[#667085] flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#2457D6] shrink-0" />
                          {turf.locationText}
                        </p>
                      </div>

                      {/* Owner Details */}
                      <div className="p-2.5 bg-[#F7F7F2] rounded-xl border border-[#E6E8EC] flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[10px] text-[#98A2B3] uppercase font-bold">Turf Owner</p>
                          <p className="font-bold text-[#172033]">{turf.ownerName}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2457D6]">
                          <PhoneCall className="w-3 h-3" /> Contact
                        </span>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {turf.amenities.map(a => (
                          <span key={a} className="text-[10px] font-bold px-2 py-0.5 bg-[#F7F7F2] border border-[#E6E8EC] text-[#667085] rounded">
                            ✓ {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="p-4 border-t border-[#E6E8EC] flex items-center justify-between gap-3 bg-white">
                    <div>
                      <span className="text-[10px] text-[#98A2B3] uppercase font-bold block">Pricing</span>
                      <span className="text-base font-black text-[#2457D6]">₹{turf.pricePerHour}<span className="text-xs text-[#667085] font-semibold">/hr</span></span>
                    </div>

                    <Link
                      to={`/create-match?venue=${encodeURIComponent(turf.name)}`}
                      className="px-4 py-2.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow-sm uppercase tracking-wider"
                    >
                      Host Match Here
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACTIVE MATCHES VIEW */}
        {activeMainTab === 'MATCHES' && (
          <section className="space-y-4">
            {/* Sport Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {sportsList.map((sport) => (
                <button
                  key={sport}
                  onClick={() => { setSportFilter(sport); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    sportFilter === sport
                      ? 'bg-[#2457D6] text-white shadow-sm'
                      : 'bg-white border border-[#E6E8EC] text-[#667085] hover:text-[#172033] hover:bg-blue-50/50'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold tracking-tight text-[#172033]">
                Available Matches ({matches.length})
              </h2>
              <span className="text-xs text-[#98A2B3] font-medium">Page {page}</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[#667085] flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin mb-3" />
                Loading games...
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white border border-[#E6E8EC] rounded-xl p-10 text-center space-y-3 shadow-sm">
                <Trophy className="w-10 h-10 text-[#98A2B3] mx-auto" />
                <h3 className="text-base font-bold text-[#172033]">No games found</h3>
                <p className="text-xs text-[#667085] max-w-sm mx-auto">
                  No active matches matched your criteria. Try clearing search filters or host the first game!
                </p>
                <Link to="/create-match" className="inline-block px-5 py-2.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow uppercase tracking-wider">
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
                      className="bg-white border border-[#E6E8EC] hover:border-[#2457D6]/50 rounded-xl p-5 transition-all flex flex-col justify-between space-y-4 group shadow-sm"
                    >
                      <div className="space-y-3">
                        {/* Badge Top Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#2457D6]/10 border border-[#2457D6]/20 text-[#2457D6]">
                              {isEGame ? `🎮 ${m.eGameName || 'E-GAME'}` : `#${m.tags?.[0] || 'sport'}`}
                            </span>
                            {isEGame && m.eGameMode && (
                              <span className="px-2 py-0.5 bg-[#F7F7F2] border border-[#E6E8EC] text-[10px] font-semibold text-[#667085] rounded">
                                {m.eGameMode}
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-bold text-[#16803C] bg-[#16803C]/10 px-2.5 py-1 rounded-md border border-[#16803C]/20">
                            {m.pricePerHead === 0 || !m.pricePerHead ? 'Free' : `₹${m.pricePerHead}`}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-[#172033] group-hover:text-[#2457D6] transition-colors line-clamp-1">
                          {m.title}
                        </h3>

                        {/* Date & Location Metadata */}
                        <div className="space-y-1.5 text-xs text-[#667085]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
                            <span>
                              {new Date(m.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
                            <span className="truncate">{m.locationText || 'Online / Custom Room'}</span>
                          </div>
                        </div>
                      </div>

                      {/* People Roster & Slot Progress */}
                      <div className="pt-3 border-t border-[#E6E8EC] space-y-3">
                        {/* Host & Player Count */}
                        <div className="flex items-center justify-between text-xs">
                          <Link 
                            to={`/profile/${m.hostId}`} 
                            className="flex items-center gap-2 hover:underline"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#2457D6] text-white font-bold text-[10px] flex items-center justify-center">
                              {m.host?.profile?.name?.[0]?.toUpperCase() || 'H'}
                            </div>
                            <span className="text-[#172033] font-medium">{m.host?.profile?.name || 'Host'}</span>
                          </Link>

                          <span className={`font-bold ${isFull ? 'text-[#D97706]' : 'text-[#2457D6]'}`}>
                            {m.filledSlots} / {m.totalSlots} Slots
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#F7F7F2] rounded-full h-1.5 overflow-hidden border border-[#E6E8EC]">
                          <div 
                            className="h-full rounded-full bg-[#2457D6]"
                            style={{ width: `${filledRatio}%` }}
                          />
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-[#98A2B3] font-medium">
                            {isPassed ? 'Game Passed' : isFull ? 'Full Capacity' : `${m.totalSlots - m.filledSlots} spots left`}
                          </span>

                          <Link
                            to={`/match/${m.id}`}
                            className="px-4 py-2 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow-sm transition-colors uppercase tracking-wider"
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
            <div className="flex items-center justify-between pt-4 border-t border-[#E6E8EC]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 bg-white border border-[#E6E8EC] hover:bg-gray-50 text-xs font-bold rounded-lg text-[#172033] disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-bold text-[#98A2B3]">Page {page}</span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-3.5 py-1.5 bg-white border border-[#E6E8EC] hover:bg-gray-50 text-xs font-bold rounded-lg text-[#172033] disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
