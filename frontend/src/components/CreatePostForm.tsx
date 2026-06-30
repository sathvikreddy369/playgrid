import React, { useState } from 'react';
import { useCreatePost } from '../hooks/usePosts';
import { Send, Image as ImageIcon, MapPin, Tag, X, Navigation, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CreatePostForm = () => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('GENERAL');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const createPost = useCreatePost();

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag.toLowerCase())) {
      setTags([...tags, tag.toLowerCase()]);
    }
    setTagInput('');
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setLatitude(lat);
      setLongitude(lon);
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`);
        const data = await res.json();
        if (data.features?.length > 0) {
          setLocation(data.features[0].place_name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLocating(false);
      }
    }, () => {
      alert('Unable to retrieve location');
      setIsLocating(false);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost.mutate(
      { content, type: postType, location, latitude, longitude, tags },
      {
        onSuccess: () => {
          setContent('');
          setLocation('');
          setLatitude(null);
          setLongitude(null);
          setTags([]);
          setIsExpanded(false);
        },
        onError: (err: any) => alert(err.response?.data?.error || 'Failed to post'),
      }
    );
  };

  return (
    <div className="card p-5 mb-6 transition-all duration-300 focus-within:shadow-md focus-within:border-primary-200 dark:focus-within:border-primary-900/50">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full bg-transparent resize-none border-none focus:ring-0 text-foreground placeholder-muted text-lg outline-none min-h-[60px]"
          rows={isExpanded || content ? 3 : 1}
          placeholder="What's happening in your sports world?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
        />
        
        <AnimatePresence>
          {(isExpanded || content) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-2 space-y-3">
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4 text-muted shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Add location" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)}
                    className="flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 text-foreground outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={handleUseLocation} 
                    disabled={isLocating} 
                    className="text-[11px] font-medium flex items-center gap-1 bg-surface border border-border px-2 py-1 rounded-md hover:bg-border transition-colors text-muted hover:text-foreground"
                  >
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                    Auto
                  </button>
                </div>

                <div className="flex flex-col gap-2 bg-background border border-border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Add tags (press Enter)" 
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      className="flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 text-foreground outline-none"
                    />
                    <select 
                      onChange={e => handleAddTag(e.target.value)} 
                      value="" 
                      className="text-[11px] font-medium bg-surface border border-border rounded-md px-2 py-1 text-muted focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>Popular</option>
                      <option value="cricket">Cricket</option>
                      <option value="football">Football</option>
                      <option value="badminton">Badminton</option>
                      <option value="tennis">Tennis</option>
                    </select>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-1">
                      {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-1 rounded-md text-xs font-medium">
                          #{tag}
                          <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-primary-800 dark:hover:text-primary-200"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="text-xs font-medium bg-background border border-border rounded-full px-3 py-1.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-foreground cursor-pointer outline-none transition-all"
            >
              <option value="GENERAL">General</option>
              <option value="LOOKING_FOR_PLAYERS">Looking for Players</option>
              <option value="LOOKING_FOR_TEAM">Looking for Team</option>
              <option value="QUESTION">Question</option>
            </select>
            <button type="button" className="p-1.5 text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || createPost.isPending}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary-600/20"
          >
            {createPost.isPending ? 'Posting...' : 'Post'}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
