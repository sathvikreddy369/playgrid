import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock Requests
const MOCK_REQUESTS = [
  { id: 1, name: 'Alex Johnson', level: 'Intermediate', matchesAttended: 12, rating: 4.8, status: 'PENDING' },
  { id: 2, name: 'Sarah Williams', level: 'Beginner', matchesAttended: 3, rating: 5.0, status: 'PENDING' },
  { id: 3, name: 'Michael Chen', level: 'Advanced', matchesAttended: 45, rating: 4.9, status: 'ACCEPTED' },
];

export default function MatchManagement() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  
  // Match Info Mock
  const totalSlots = 14;
  const filledSlots = requests.filter(r => r.status === 'ACCEPTED').length;

  const handleAction = (id: number, newStatus: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Match</h1>
            <p className="text-zinc-400 mt-1">Sunday Morning Football • Oct 15, 2023</p>
          </div>
          <div className="flex gap-4">
            <Link to="/review/1" className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl px-6 flex items-center justify-center font-bold shadow-lg transition-colors">
              <Star className="w-5 h-5 mr-2" />
              Review Match
            </Link>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center min-w-[120px]">
              <p className="text-sm text-zinc-400 font-medium mb-1">Slots Filled</p>
              <p className="text-2xl font-bold">
                <span className={filledSlots >= totalSlots ? 'text-emerald-400' : 'text-white'}>{filledSlots}</span>
                <span className="text-zinc-500 text-lg"> / {totalSlots}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Pending Requests ({requests.filter(r => r.status === 'PENDING').length})
            </h2>
            
            <AnimatePresence>
              {requests.filter(r => r.status === 'PENDING').length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-500">
                  No pending requests right now.
                </div>
              ) : (
                requests.filter(r => r.status === 'PENDING').map(req => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={req.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{req.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{req.level}</span>
                          <span>★ {req.rating}</span>
                          <span>{req.matchesAttended} matches played</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAction(req.id, 'REJECTED')}
                        className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'ACCEPTED')}
                        disabled={filledSlots >= totalSlots}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl flex items-center gap-2 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Roster / Accepted */}
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-indigo-400" />
                Current Roster
              </h2>
              
              <div className="space-y-4">
                {requests.filter(r => r.status === 'ACCEPTED').map(req => (
                  <motion.div layout key={req.id} className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{req.name}</p>
                        <p className="text-xs text-zinc-500">{req.level}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty slots placeholders */}
                {Array.from({ length: Math.max(0, totalSlots - filledSlots) }).slice(0, 3).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-zinc-800 text-zinc-600">
                    <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700" />
                    <p className="text-sm font-medium">Available Slot</p>
                  </div>
                ))}
                {totalSlots - filledSlots > 3 && (
                  <div className="text-center text-xs text-zinc-500 pt-2">
                    + {totalSlots - filledSlots - 3} more slots available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
