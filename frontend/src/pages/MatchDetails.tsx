import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, UserPlus, CheckCircle, ShieldAlert, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';

export default function MatchDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('NONE');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/${id}`);
        setMatch(res.data.match);
        
        // Check if current user has already requested
        if (user) {
          const existingRequest = res.data.match.requests.find((r: any) => r.userId === user.id);
          if (existingRequest) {
            setRequestStatus(existingRequest.status);
          }
        }
      } catch (err) {
        console.error('Failed to fetch match details', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMatch();
  }, [id, user]);

  const handleRequestJoin = async () => {
    if (!id || !user) return;
    setRequesting(true);
    try {
      await api.post(`/requests/${id}`);
      setRequestStatus('PENDING');
    } catch (err) {
      console.error('Failed to request join', err);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <h2 className="text-xl text-zinc-400">Match not found</h2>
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
          <div className="h-48 bg-gradient-to-r from-blue-600/20 to-purple-600/20 relative flex items-end p-8 border-b border-zinc-800">
            <div className="absolute top-4 right-4 flex gap-2">
              {match.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-zinc-950/50 backdrop-blur border border-zinc-700/50 text-zinc-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  # {tag}
                </span>
              ))}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{match.title}</h1>
              <p className="text-zinc-400 flex items-center gap-2">
                Hosted by <span className="text-indigo-400 font-medium cursor-pointer hover:underline">{match.host?.profile?.name || 'Unknown'}</span>
              </p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-3">About this match</h2>
                <p className="text-zinc-300 leading-relaxed bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  {match.description}
                </p>
              </section>

              <section className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">Date & Time</p>
                    <p className="text-white">{new Date(match.date).toLocaleDateString()}</p>
                    <p className="text-zinc-300 text-sm">{new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">Location</p>
                    <p className="text-white">{match.locationText || 'Online / TBD'}</p>
                    {match.mapLink && <a href={match.mapLink} target="_blank" rel="noreferrer" className="text-indigo-400 text-sm hover:underline mt-1 block">View on Map</a>}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-950/80 p-6 rounded-3xl border border-zinc-800 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium mb-1">Price</p>
                    <p className="text-3xl font-bold text-white flex items-center">
                      {match.pricePerHead === 0 ? 'Free' : `₹${match.pricePerHead}`} <span className="text-sm text-zinc-500 font-normal ml-1">/ person</span>
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-zinc-400">Spots Filled</span>
                    <span className="text-white font-medium">{match.filledSlots} / {match.totalSlots}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${(match.filledSlots / match.totalSlots) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-indigo-400 mt-2 text-right">
                    {match.totalSlots - match.filledSlots} spots left!
                  </p>
                </div>

                {requestStatus === 'NONE' && match.hostId !== user?.id && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestJoin}
                    disabled={requesting || match.status !== 'AVAILABLE' || new Date(match.date) < new Date()}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {requesting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        {new Date(match.date) < new Date() ? 'Match Passed' : match.status === 'AVAILABLE' ? 'Request to Join' : 'Match Unavailable'}
                      </>
                    )}
                  </motion.button>
                )}

                {requestStatus === 'PENDING' && (
                  <div className="w-full py-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl font-medium flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Request Pending Approval
                  </div>
                )}

                {requestStatus === 'ACCEPTED' && (
                  <div className="space-y-3">
                    <div className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      You're In!
                    </div>
                    <Link to="/review/1" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all">
                      <Star className="w-5 h-5" />
                      Review Match
                    </Link>
                  </div>
                )}
              </div>

              <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex items-start gap-3 text-sm text-zinc-400">
                <ShieldAlert className="w-5 h-5 text-zinc-500 shrink-0" />
                <p>Host will review your profile before accepting your request. Make sure your profile is complete.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
