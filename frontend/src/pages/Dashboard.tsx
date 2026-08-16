import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, Calendar, Users, Plus, Settings, MessageCircle } from 'lucide-react';

import { useEffect } from 'react';
import { api } from '../api';

export interface Match {
  id: string;
  hostId: string;
  title: string;
  isOnline: boolean;
  locationText: string | null;
  mapLink: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string;
  isWeekend: boolean;
  totalSlots: number;
  filledSlots: number;
  pricePerHead: number | null;
  status: string;
  tags: string[];
}

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'FILLED'>('AVAILABLE');
  const [filterTag, setFilterTag] = useState('');

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMatches = async (pageNum: number, search: string, tag: string, reset: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', '5');
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);

      const res = await api.get(`/matches?${params.toString()}`);
      
      if (reset) {
        setMatches(res.data.matches);
      } else {
        setMatches(prev => [...prev, ...res.data.matches]);
      }
      setHasMore(res.data.hasMore);

      if (user && !profile) {
        const profileRes = await api.get('/users/profile');
        setProfile(profileRes.data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch and on search/tag change
  useEffect(() => {
    setPage(1);
    fetchMatches(1, searchQuery, filterTag, true);
  }, [searchQuery, filterTag, user]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMatches(nextPage, searchQuery, filterTag, false);
  };

  const filteredMatches = matches.filter(m => {
    const matchesStatus = m.status === activeTab;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.locationText && m.locationText.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = filterTag ? m.tags.includes(filterTag.toLowerCase()) : true;
    return matchesStatus && matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="font-bold text-white leading-none">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Playgrid</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/messages" className="text-zinc-400 hover:text-white transition p-2">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <Link to="/profile" className="text-sm font-medium text-zinc-400 hover:text-white transition">Profile</Link>
            <button onClick={signOut} className="text-sm font-medium text-zinc-400 hover:text-white transition">Sign Out</button>
            {profile?.venueType !== 'SWIMMING_POOL' && (
              <Link to="/create-match" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4" />
                Host Match
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar / Filters */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-2 block">Quick Tags</label>
                <div className="flex flex-wrap gap-2">
                  {['cricket', 'football', 'bgmi', 'weekend', 'turf'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        filterTag === tag 
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Find Nearby
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Feed */}
        <div className="flex-1 space-y-6">
          
          {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search matches by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition text-white placeholder-zinc-500"
          />
        </div>

        {/* Tabs */}
          <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab('AVAILABLE')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'AVAILABLE' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Available Matches
            </button>
            <button 
              onClick={() => setActiveTab('FILLED')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'FILLED' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Filled / Ongoing
            </button>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="col-span-full py-12 text-center text-zinc-500 flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  Loading matches...
                </div>
              ) : filteredMatches.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full py-12 text-center text-zinc-500"
                >
                  No matches found matching your filters.
                </motion.div>
              ) : (
                <>
                  {filteredMatches.map(match => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={match.id}
                      onClick={() => navigate(`/match/${match.id}`)}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 transition-colors group cursor-pointer relative"
                    >
                      {user && match.hostId === user.id && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/manage/${match.id}`); }}
                          className="absolute -top-3 -right-3 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                          title="Manage Match"
                        >
                          <Settings className="w-4 h-4 text-zinc-300" />
                        </button>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-400 transition-colors">
                          {match.title}
                        </h3>
                        <div className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-xs font-medium text-emerald-400 shrink-0">
                          {match.pricePerHead === 0 || !match.pricePerHead ? 'Free' : `₹${match.pricePerHead}`}
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>{new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate">{match.locationText || 'Online / TBD'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span className="font-medium">
                            <span className={match.filledSlots >= match.totalSlots ? 'text-red-400' : 'text-white'}>
                              {match.filledSlots}
                            </span>
                            <span className="text-zinc-500"> / {match.totalSlots}</span>
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          {match.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-zinc-950 rounded border border-zinc-800 text-zinc-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {hasMore && (
                    <div className="col-span-full flex justify-center mt-8">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-medium transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {loadingMore && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                        Load More Matches
                      </button>
                    </div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </main>

      {/* Mobile FAB */}
      {profile?.venueType !== 'SWIMMING_POOL' && (
        <Link 
          to="/create-match" 
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/50 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
