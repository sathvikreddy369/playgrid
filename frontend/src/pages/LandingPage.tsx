import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, MapPin, ArrowRight, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

import { api } from '../api';
import { useAuth } from '../components/AuthProvider';

export default function LandingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If user is already logged in, redirect directly to dashboard
    if (session) {
      navigate('/dashboard');
      return;
    }

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
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Playgrid
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-full shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-zinc-800/50">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-indigo-400 mb-8 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hyderabad's #1 Sports & Match Organizing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
            Discover Sports Matches & <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Play With Players Near You
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Organize box cricket, football turfs, badminton doubles, and swimming sessions effortlessly. Join games, chat in real-time, and manage sports activities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              Find Games Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold rounded-2xl transition-colors flex items-center justify-center"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-zinc-900">
            <div>
              <p className="text-3xl font-extrabold text-white mb-1">1,200+</p>
              <p className="text-xs text-zinc-500 font-medium">Active Players</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-400 mb-1">450+</p>
              <p className="text-xs text-zinc-500 font-medium">Matches Hosted</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-purple-400 mb-1">25+</p>
              <p className="text-xs text-zinc-500 font-medium">Partner Venues</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-400 mb-1">98%</p>
              <p className="text-xs text-zinc-500 font-medium">Match Attendance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Public Matches Section */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Live Upcoming Matches</h2>
            <p className="text-zinc-400 text-sm">Join active sports sessions hosted by players across Hyderabad</p>
          </div>
          <Link 
            to="/register" 
            className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center gap-1.5 transition-colors"
          >
            View All Matches →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            Loading live games...
          </div>
        ) : featuredMatches.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-500">
            No matches scheduled right now. Be the first to host one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMatches.map((m) => (
              <div 
                key={m.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      #{m.tags?.[0] || 'sports'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {m.pricePerHead === 0 || !m.pricePerHead ? 'Free' : `₹${m.pricePerHead}`}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-3 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {m.title}
                  </h3>
                  <div className="space-y-2 text-xs text-zinc-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{new Date(m.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{m.locationText || 'Online / TBD'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {m.filledSlots} / {m.totalSlots} Slots
                  </span>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Join Game
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-zinc-900/30 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Built for Real Sports Enthusiasts</h2>
            <p className="text-zinc-400 text-sm">Everything you need to find games, build sports groups, and manage local ground bookings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Location-Based Discovery</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Mapbox GL integration allows you to pin turfs, discover matches nearby, and filter games by sports and distance.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Host Approval & Security</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Hosts review player profiles before accepting join requests. Interactive transactions prevent overbooking.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Realtime Socket Chat</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Connect instantly with match participants in dedicated, authenticated Socket.IO chat rooms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Playgrid. Built with React, Express, PostgreSQL & Supabase.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-zinc-300">Sign In</Link>
            <Link to="/register" className="hover:text-zinc-300">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
