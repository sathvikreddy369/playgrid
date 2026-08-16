import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle } from 'lucide-react';

// Mock Data
const MOCK_PARTICIPANTS = [
  { id: 1, name: 'Alex Johnson', avatar: 'A', attended: null as boolean | null },
  { id: 2, name: 'Sarah Williams', avatar: 'S', attended: null as boolean | null },
  { id: 3, name: 'Michael Chen', avatar: 'M', attended: null as boolean | null },
];

export default function MatchReview() {
  
  // Assuming for demo we can toggle between 'HOST' view and 'PLAYER' view
  const [viewRole, setViewRole] = useState<'HOST' | 'PLAYER'>('PLAYER');

  // Player State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  // Host State
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);

  const [saving, setSaving] = useState(false);

  const handleAttendance = (id: number, attended: boolean) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, attended } : p));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Review submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* View Toggle for Demo Purposes */}
        <div className="flex justify-end mb-4 bg-zinc-900 p-2 rounded-xl w-fit ml-auto border border-zinc-800">
          <button 
            onClick={() => setViewRole('PLAYER')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewRole === 'PLAYER' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            View as Player
          </button>
          <button 
            onClick={() => setViewRole('HOST')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewRole === 'HOST' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            View as Host
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8 pb-8 border-b border-zinc-800">
            <h1 className="text-2xl font-bold mb-2">Post-Match Summary</h1>
            <p className="text-zinc-400">Sunday Morning Football • Oct 15, 2023</p>
          </div>

          {viewRole === 'PLAYER' ? (
            <form onSubmit={handleSubmitReview} className="space-y-8">
              <div className="text-center">
                <h2 className="text-lg font-bold mb-4">How was the match & host?</h2>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-zinc-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-zinc-500">Tap a star to rate</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Write a Review (Optional)</label>
                <textarea 
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 mt-2 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                  placeholder="How was the turf? Was the host friendly?"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving || rating === 0}
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit Review"
                )}
              </motion.button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Mark Attendance</h2>
                <p className="text-sm text-zinc-400">Update player stats</p>
              </div>

              <div className="space-y-3">
                {participants.map(p => (
                  <div key={p.id} className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm">
                        {p.avatar}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAttendance(p.id, false)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                          p.attended === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        No Show
                      </button>
                      <button 
                        onClick={() => handleAttendance(p.id, true)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                          p.attended === true ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Attended
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitReview}
                disabled={saving}
                className="w-full mt-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                ) : (
                  "Save Attendance"
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
