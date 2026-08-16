import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { isWeekend, parseISO } from 'date-fns';

import MapboxPicker from '../components/MapboxPicker';
import { CalendarPlus, MapPin, Globe, Users, DollarSign, Tag as TagIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function CreateMatch() {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [totalSlots, setTotalSlots] = useState('10');
  const [pricePerHead, setPricePerHead] = useState('0');
  
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [addressLink, setAddressLink] = useState('');
  
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically compute if selected date is a weekend
  const weekendTag = useMemo(() => {
    if (!date) return null;
    try {
      const parsedDate = parseISO(date);
      return isWeekend(parsedDate) ? 'Weekend' : 'Weekday';
    } catch (e) {
      return null;
    }
  }, [date]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const matchDateTime = new Date(`${date}T${time || '00:00'}:00`).toISOString();
      const payload = {
        title,
        description: description || undefined,
        isOnline,
        locationText: addressLink || undefined,
        mapLink: addressLink.startsWith('http') ? addressLink : undefined,
        latitude: location?.lat,
        longitude: location?.lng,
        date: matchDateTime,
        totalSlots: parseInt(totalSlots) || 10,
        pricePerHead: parseFloat(pricePerHead) || 0,
        tags
      };

      const res = await api.post('/matches', payload);
      navigate(`/match/${res.data.match.id}`);
    } catch (err: any) {
      console.error('Failed to create match', err);
      setError(err?.response?.data?.error || err?.response?.data?.issues?.[0]?.message || 'Failed to create match. Please check inputs.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-8"
        >
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CalendarPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Host a Match</h1>
              <p className="text-zinc-400 text-sm">Organize a game and let others join you</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-8">

            {/* Basic Details */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Match Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                  placeholder="e.g. Sunday Morning Football"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none resize-none"
                  placeholder="Rules, requirements, or what to expect..."
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Date</label>
                <div className="relative mt-1">
                  <CalendarPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Time</label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="time" 
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                  />
                </div>
              </div>
            </div>

            {/* Type & Location */}
            <div className="space-y-5 pt-6 border-t border-zinc-800/50">
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={!isOnline} 
                    onChange={() => setIsOnline(false)}
                    className="w-4 h-4 text-indigo-500 bg-zinc-900 border-zinc-700 focus:ring-indigo-500/50" 
                  />
                  <MapPin className={`w-5 h-5 ${!isOnline ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span className={!isOnline ? 'text-white font-medium' : 'text-zinc-400'}>In-Person Match</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={isOnline} 
                    onChange={() => setIsOnline(true)}
                    className="w-4 h-4 text-indigo-500 bg-zinc-900 border-zinc-700 focus:ring-indigo-500/50" 
                  />
                  <Globe className={`w-5 h-5 ${isOnline ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span className={isOnline ? 'text-white font-medium' : 'text-zinc-400'}>Online (e-Sports)</span>
                </label>
              </div>

              {!isOnline ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-300 ml-1">Google Maps Link / Address Details</label>
                    <input 
                      type="text" 
                      value={addressLink}
                      onChange={e => setAddressLink(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Paste google maps link here..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 ml-1 mb-2 block">Pin Location on Map</label>
                    <MapboxPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />

                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-zinc-300 ml-1">Game Link or Server Info</label>
                  <input 
                    type="text" 
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. Discord server link or lobby code..."
                  />
                </div>
              )}
            </div>

            {/* Slots & Pricing */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800/50">
              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Total Slots</label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="number" 
                    min="2"
                    required
                    value={totalSlots}
                    onChange={e => setTotalSlots(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 ml-1">Price Per Head (₹)</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="number"
                    min="0"
                    value={pricePerHead}
                    onChange={e => setPricePerHead(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Leave 0 if free"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-6 border-t border-zinc-800/50">
              <label className="text-sm font-medium text-zinc-300 ml-1">Tags (Press Enter)</label>
              <div className="relative mt-1">
                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                  placeholder="e.g. cricket, hyderabad, beginner"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {weekendTag && (
                  <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium">
                    # {weekendTag}
                  </span>
                )}
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium flex items-center gap-2 group">
                    # {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-zinc-500 group-hover:text-white transition-colors">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={saving}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center transition-all disabled:opacity-50 text-lg"
              >
                {saving ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Post Match"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
