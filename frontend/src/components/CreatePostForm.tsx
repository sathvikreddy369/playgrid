import React, { useState } from 'react';
import { useCreatePost } from '../hooks/usePosts';
import { Send, Image as ImageIcon, MapPin, Tag, X, Navigation, Loader2 } from 'lucide-react';

export const CreatePostForm = () => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('GENERAL');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
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
        },
        onError: (err: any) => alert(err.response?.data?.error || 'Failed to post'),
      }
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full bg-transparent resize-none border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-lg p-2"
          rows={3}
          placeholder="What's happening in your sports world?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div className="px-2 space-y-3 mt-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Add location" 
              value={location} 
              onChange={e => setLocation(e.target.value)}
              className="flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300"
            />
            <button type="button" onClick={handleUseLocation} disabled={isLocating} className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
              Auto
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
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
                className="flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300"
              />
              <select onChange={e => handleAddTag(e.target.value)} value="" className="text-xs bg-gray-100 dark:bg-gray-700 border-none rounded px-2 py-1">
                <option value="" disabled>Popular</option>
                <option value="cricket">Cricket</option>
                <option value="football">Football</option>
                <option value="badminton">Badminton</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-6">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                    #{tag}
                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-blue-800 dark:hover:text-blue-200"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-full px-3 py-1.5 focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <option value="GENERAL">General</option>
              <option value="LOOKING_FOR_PLAYERS">Looking for Players</option>
              <option value="LOOKING_FOR_TEAM">Looking for Team</option>
              <option value="QUESTION">Question</option>
            </select>
            <button type="button" className="text-gray-500 hover:text-blue-500 transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || createPost.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPost.isPending ? 'Posting...' : 'Post'}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
