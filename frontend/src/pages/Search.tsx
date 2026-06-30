import React, { useState, useEffect } from 'react';
import { useGlobalSearch, useAISearch } from '../hooks/useSearch';
import { useAuth } from '../providers/AuthProvider';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Sparkles, Loader2, Users, Calendar } from 'lucide-react';

import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [isAIMode, setIsAIMode] = useState(false);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [coords, setCoords] = useState<{lat: string, lng: string} | null>(null);

  const { profile } = useAuth();
  
  // When Nearby Mode is toggled, request geolocation or use profile home location
  useEffect(() => {
    if (isNearbyMode && !coords) {
      if (profile?.homeLatitude && profile?.homeLongitude) {
        setCoords({ lat: profile.homeLatitude.toString(), lng: profile.homeLongitude.toString() });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setCoords({ lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }),
          (err) => {
            alert('Failed to get location from browser. Please set your home location in your profile.');
            setIsNearbyMode(false);
          }
        );
      }
    }
  }, [isNearbyMode, profile]);

  // Standard Search hook
  const { data: searchResults, isLoading: searchLoading } = useGlobalSearch({
    q: query,
    type,
    ...(isNearbyMode && coords ? { lat: coords.lat, lng: coords.lng } : {})
  });

  // AI Search Hook
  const aiSearch = useAISearch();
  const [aiResults, setAiResults] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query, type });
    
    if (isAIMode) {
      aiSearch.mutate(query, {
        onSuccess: (data) => setAiResults(data)
      });
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const renderResults = () => {
    if (isAIMode) {
      if (aiSearch.isPending) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>;
      if (!aiResults) return null;
      if (aiResults.error) return <div className="text-red-500 p-10 text-center">{aiResults.error}</div>;
      
      return (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-900">
            <strong>AI Filters Applied:</strong> <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded">{JSON.stringify(aiResults.aiFiltersApplied, null, 2)}</pre>
          </div>
          {aiResults.matches?.length > 0 ? (
            <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiResults.matches.map((m: any) => (
                <MotionLink variants={itemVariants} to={`/matches/${m.id}`} key={m.id} className="bg-white border rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition-all">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold">{m.sport}</span>
                  <h3 className="font-bold text-lg mt-2">{m.title}</h3>
                  <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4"/> {m.location}
                  </div>
                </MotionLink>
              ))}
            </motion.div>
          ) : (
            <div className="text-center p-10 text-gray-500">No results matched your AI prompt.</div>
          )}
        </div>
      );
    }

    if (searchLoading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    if (!searchResults) return null;

    if (searchResults.nearby) {
      return (
        <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.results?.map((item: any) => (
             <MotionLink variants={itemVariants} to={`/${type.toLowerCase()}/${item.id}`} key={item.id} className="bg-white border rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-lg">{item.title || item.name}</h3>
                 <p className="text-sm text-gray-500">{item.location}</p>
               </div>
               <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                 {item.distance?.toFixed(1)} km
               </span>
             </MotionLink>
          ))}
        </motion.div>
      );
    }

    return (
      <div className="space-y-8">
        {searchResults.matches?.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500"/> Matches</h3>
            <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.matches.map((m: any) => (
                <MotionLink variants={itemVariants} to={`/matches/${m.id}`} key={m.id} className="bg-white border rounded-xl p-4 hover:border-orange-500">
                  <h4 className="font-bold">{m.title}</h4>
                  <p className="text-sm text-gray-500">{m.sport} • {m.location}</p>
                </MotionLink>
              ))}
            </motion.div>
          </div>
        )}

        {searchResults.grounds?.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-green-500"/> Venues</h3>
            <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.grounds.map((g: any) => (
                <MotionLink variants={itemVariants} to={`/grounds/${g.id}`} key={g.id} className="bg-white border rounded-xl p-4 hover:border-green-500">
                  <h4 className="font-bold">{g.name}</h4>
                  <p className="text-sm text-gray-500">{g.location}</p>
                </MotionLink>
              ))}
            </motion.div>
          </div>
        )}

        {searchResults.communities?.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500"/> Communities</h3>
            <motion.div initial="hidden" animate="visible" variants={staggerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.communities.map((c: any) => (
                <MotionLink variants={itemVariants} to={`/communities/${c.id}`} key={c.id} className="bg-white border rounded-xl p-4 hover:border-blue-500">
                  <h4 className="font-bold">{c.name}</h4>
                  <p className="text-sm text-gray-500">{c._count?.members} Members</p>
                </MotionLink>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10 mb-8 text-center relative overflow-hidden">
        {isAIMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 pointer-events-none"></div>
        )}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {isAIMode ? 'Ask the AI' : 'Global Search'}
        </h1>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative z-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAIMode ? "e.g. Find me cheap football matches this weekend..." : "Search for matches, venues, communities..."}
              className={`w-full pl-12 pr-4 py-4 rounded-full border-2 focus:outline-none bg-gray-50 dark:bg-gray-900 transition-colors ${
                isAIMode ? 'border-purple-200 focus:border-purple-500' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
          </div>
          <button 
            type="submit" 
            className={`px-8 py-4 rounded-full font-bold text-white transition-all shadow-md hover:shadow-lg ${
              isAIMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => { setIsAIMode(!isAIMode); setIsNearbyMode(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all border-2 ${
              isAIMode ? 'bg-purple-100 border-purple-500 text-purple-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isAIMode ? 'text-purple-600' : 'text-gray-400'}`} />
            AI Search Mode
          </button>

          {!isAIMode && (
            <button
              onClick={() => setIsNearbyMode(!isNearbyMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all border-2 ${
                isNearbyMode ? 'bg-green-100 border-green-500 text-green-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MapPin className={`w-4 h-4 ${isNearbyMode ? 'text-green-600' : 'text-gray-400'}`} />
              Nearby Mode
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Filter By</h3>
            
            <div className="space-y-2">
              {['ALL', 'MATCHES', 'GROUNDS', 'COMMUNITIES', 'USERS'].map(t => (
                <label key={t} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    disabled={isAIMode} // AI determines type automatically
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={`font-medium ${type === t ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>

            {isNearbyMode && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Distance Ranking</p>
                <div className="bg-green-50 text-green-800 text-xs p-3 rounded-lg border border-green-100">
                  Showing closest results first.
                </div>
              </div>
            )}
            
            {isAIMode && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">AI Powered</p>
                <div className="bg-purple-50 text-purple-800 text-xs p-3 rounded-lg border border-purple-100">
                  Describe what you want naturally. The AI will extract filters and search the database for you.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          {renderResults()}
        </div>
      </div>
    </div>
  );
};
