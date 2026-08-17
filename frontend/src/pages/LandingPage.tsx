import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, MapPin, ArrowRight, Zap, MessageSquare, Award } from 'lucide-react';
import { api } from '../api';

export default function LandingPage() {
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/matches?limit=4');
        setFeaturedMatches(res.data.matches || []);
      } catch (err) {
        console.error('Failed to load landing page matches', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const sportsCategories = [
    { name: 'Box Cricket', icon: '🏏', count: '120+ Active Games', desc: 'Net cricket turfs with floodlights & digital scoring' },
    { name: 'Football Turf', icon: '⚽', count: '85+ Active Turfs', desc: '5v5 & 7v7 FIFA-grade artificial grass fields' },
    { name: 'Badminton Court', icon: '🏸', count: '90+ Courts Available', desc: 'Indoor BWF synthetic courts with AC' },
    { name: 'Swimming Pool', icon: '🏊‍♂️', count: '45+ Heated Pools', desc: 'Certified trainers, life guards & temperature control' },
    { name: 'Pickleball Court', icon: '🏓', count: '30+ Pro Courts', desc: 'Fastest growing racket sport with hard courts' },
    { name: 'E-Sports Lounge', icon: '🎮', count: '60+ Gaming Rooms', desc: 'RTX 4090 gaming rigs, PS5s & 1Gbps fiber net' }
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans selection:bg-[#2457D6] selection:text-white">
      {/* Top Header Navbar */}
      <nav className="border-b border-[#E6E8EC] bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2457D6] flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#2457D6] uppercase">
              GAMEVIA
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[#667085] uppercase tracking-wider">
            <a href="#features" className="hover:text-[#2457D6] transition-colors">Features</a>
            <a href="#sports" className="hover:text-[#2457D6] transition-colors">Sports & Turfs</a>
            <a href="#how-it-works" className="hover:text-[#2457D6] transition-colors">How It Works</a>
            <a href="#owners" className="hover:text-[#2457D6] transition-colors">Turf Owners</a>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-4 py-2 bg-white border border-[#E6E8EC] hover:bg-gray-50 text-[#172033] font-bold text-xs rounded-xl transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow-sm transition-colors uppercase tracking-wider"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#E6E8EC] bg-[#F7F7F2]">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6E8EC] text-xs font-bold text-[#2457D6] mb-8 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#FF7A3D]" />
            <span>Hyderabad's #1 Sports & Turf Booking Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6 text-[#172033]">
            FIND MATCHES. BOOK TURFS. <br className="hidden sm:block" />
            <span className="text-[#2457D6]">
              GO PLAY TODAY.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#667085] max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Connect with local players for box cricket, football turfs, badminton, swimming, pickleball, and custom e-sports sessions. Join active matches or partner as a turf owner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
            >
              Explore Active Games
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E6E8EC] hover:bg-gray-50 text-[#172033] font-bold text-sm rounded-xl transition-colors flex items-center justify-center"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-[#E6E8EC]">
            <div>
              <p className="text-3xl font-black text-[#172033] mb-1">2,500+</p>
              <p className="text-xs text-[#667085] font-semibold">Active Players</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#2457D6] mb-1">850+</p>
              <p className="text-xs text-[#667085] font-semibold">Matches Played</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#172033] mb-1">60+</p>
              <p className="text-xs text-[#667085] font-semibold">Turf Partners</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#16803C] mb-1">99%</p>
              <p className="text-xs text-[#667085] font-semibold">Reliability Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports & Turfs Categories Grid */}
      <section id="sports" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 text-[#172033]">Explore Popular Sports & Venues</h2>
          <p className="text-[#667085] text-sm">Choose your favorite discipline and jump straight into local game rooms across Hyderabad.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sportsCategories.map((cat) => (
            <div key={cat.name} className="bg-white border border-[#E6E8EC] hover:border-[#2457D6]/50 rounded-2xl p-6 transition-all duration-200 shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{cat.icon}</span>
                <span className="text-xs font-extrabold text-[#2457D6] bg-[#2457D6]/10 px-3 py-1 rounded-full border border-[#2457D6]/20">
                  {cat.count}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#172033] group-hover:text-[#2457D6] transition-colors mb-2">
                {cat.name}
              </h3>
              <p className="text-xs text-[#667085] leading-relaxed mb-4">
                {cat.desc}
              </p>
              <Link to="/register" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7A3D] hover:underline uppercase tracking-wider">
                Find Games →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Public Matches Section */}
      <section className="py-16 bg-white border-y border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-[#172033]">Live Upcoming Matches</h2>
              <p className="text-[#667085] text-sm">Join games scheduled by verified community hosts</p>
            </div>
            <Link 
              to="/register" 
              className="text-[#2457D6] hover:text-[#1D4ED8] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              View All Matches →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#667085] flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin mb-4" />
              Loading live games...
            </div>
          ) : featuredMatches.length === 0 ? (
            <div className="bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl p-8 text-center text-[#667085]">
              No matches scheduled right now. Be the first to host one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMatches.map((m) => (
                <div 
                  key={m.id}
                  className="bg-[#F7F7F2] border border-[#E6E8EC] hover:border-[#2457D6]/50 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-[#2457D6]/10 border border-[#2457D6]/20 rounded-lg text-xs font-bold text-[#2457D6] uppercase tracking-wider">
                        #{m.tags?.[0] || 'sports'}
                      </span>
                      <span className="text-xs font-bold text-[#16803C] bg-[#16803C]/10 px-2 py-0.5 rounded border border-[#16803C]/20">
                        {m.pricePerHead === 0 || !m.pricePerHead ? 'Free' : `₹${m.pricePerHead}`}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-3 text-[#172033] group-hover:text-[#2457D6] transition-colors line-clamp-1">
                      {m.title}
                    </h3>
                    <div className="space-y-2 text-xs text-[#667085] mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                        <span>{new Date(m.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
                        <span className="truncate">{m.locationText || 'Hyderabad'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E6E8EC] flex items-center justify-between">
                    <span className="text-xs text-[#667085] flex items-center gap-1.5 font-semibold">
                      <Users className="w-3.5 h-3.5 text-[#2457D6]" />
                      {m.filledSlots} / {m.totalSlots} Slots
                    </span>
                    <Link
                      to="/login"
                      className="text-xs font-bold text-white bg-[#FF7A3D] hover:bg-[#EA622D] px-3.5 py-1.5 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                    >
                      Join Game
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-[#172033]">Built for Real Sports Enthusiasts</h2>
          <p className="text-[#667085] text-sm">Everything you need to discover matches, build player reputation, and book venues seamlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#E6E8EC] rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#2457D6]/10 border border-[#2457D6]/20 flex items-center justify-center mb-6 text-[#2457D6]">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#172033]">Location Radar & Map UI</h3>
            <p className="text-[#667085] text-sm leading-relaxed">
              Find matches and ground venues near your current coordinates with custom radius filtering and map popover previews.
            </p>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#FF7A3D]/10 border border-[#FF7A3D]/20 flex items-center justify-center mb-6 text-[#FF7A3D]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#172033]">GAMEVIA Reliability Score</h3>
            <p className="text-[#667085] text-sm leading-relaxed">
              Every player maintains an attendance score. Host approval flows ensure no-shows are penalized and matches start on time.
            </p>
          </div>

          <div className="bg-white border border-[#E6E8EC] rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#2457D6]/10 border border-[#2457D6]/20 flex items-center justify-center mb-6 text-[#2457D6]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#172033]">Realtime Socket Chat</h3>
            <p className="text-[#667085] text-sm leading-relaxed">
              Coordinate team positions, turf directions, and match timings with instant Socket.IO room chats for each game.
            </p>
          </div>
        </div>
      </section>

      {/* Turf Owner Partner Section */}
      <section id="owners" className="py-20 bg-white border-y border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#2457D6] rounded-3xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-md">
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-extrabold uppercase px-3 py-1 bg-white/10 rounded-full border border-white/20">
                🏢 Partner With GAMEVIA
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Own a Turf, Pool, or Sports Arena?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                List your box cricket turf, badminton courts, or swimming pool on GAMEVIA to receive instant player match bookings, automated host inquiries, and maximum slot occupancy.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0 flex flex-col gap-3">
              <Link
                to="/register"
                className="px-8 py-4 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-black text-sm rounded-xl text-center shadow-sm uppercase tracking-wider"
              >
                Register as Turf Owner
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl text-center border border-white/20"
              >
                Owner Portal Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-[#172033]">How GAMEVIA Works</h2>
          <p className="text-[#667085] text-sm">Three quick steps to get on the court and start playing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2457D6] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-[#172033]">Choose Sport or Turf</h3>
            <p className="text-xs text-[#667085] max-w-xs mx-auto">
              Browse physical sports or custom gaming rooms based on your location and preferred time slot.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FF7A3D] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-[#172033]">Join or Host Match</h3>
            <p className="text-xs text-[#667085] max-w-xs mx-auto">
              Send a join request to the host or create your own game room with custom player caps.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#16803C] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-[#172033]">Play & Build Score</h3>
            <p className="text-xs text-[#667085] max-w-xs mx-auto">
              Show up at the venue, chat in real-time, play your match, and maintain a 100% attendance score.
            </p>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="border-t border-[#E6E8EC] bg-white py-16 text-xs text-[#667085]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2457D6] flex items-center justify-center shadow-sm">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-[#2457D6] uppercase tracking-tight">
                GAMEVIA
              </span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              GAMEVIA is a consumer sports community platform designed for organizing local games, booking box cricket turfs, badminton courts, swimming pools, and e-sports rooms.
            </p>
            <p className="text-[11px] text-[#98A2B3]">
              📍 Hyderabad, Telangana, India
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#172033] text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/register" className="hover:text-[#2457D6] transition-colors">Find Matches</Link></li>
              <li><Link to="/register" className="hover:text-[#2457D6] transition-colors">Host a Game</Link></li>
              <li><Link to="/register" className="hover:text-[#2457D6] transition-colors">Turf Owner Partner</Link></li>
              <li><Link to="/login" className="hover:text-[#2457D6] transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#2457D6] transition-colors">Register Account</Link></li>
            </ul>
          </div>

          {/* Sports Directory */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#172033] text-sm uppercase tracking-wider">Sports Directory</h4>
            <ul className="space-y-2 font-medium">
              <li><span className="hover:text-[#2457D6] cursor-pointer">Box Cricket Turfs</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">5v5 / 7v7 Football Fields</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">Indoor Badminton Courts</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">Heated Swimming Pools</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">Pickleball Hard Courts</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">E-Sports Gaming Lounges</span></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#172033] text-sm uppercase tracking-wider">Support & Legal</h4>
            <ul className="space-y-2 font-medium">
              <li><span className="hover:text-[#2457D6] cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">Host Safety Guidelines</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">Help & FAQs</span></li>
              <li><span className="hover:text-[#2457D6] cursor-pointer">Contact Support</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-[#E6E8EC] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#98A2B3]">
          <p>© {new Date().getFullYear()} GAMEVIA Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-[#172033] transition-colors font-bold">Sign In</Link>
            <Link to="/register" className="hover:text-[#172033] transition-colors font-bold">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
