import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { signOut } from '../lib/firebase';
import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '../components/PostCard';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile = () => {
  const { user, profile, firebaseUser, syncUser } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'replies' | 'matches'>('posts');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    location: profile.location || '',
    homeLatitude: profile.homeLatitude || '',
    homeLongitude: profile.homeLongitude || '',
    age: profile.age || '',
    favoriteGames: profile.favoriteGames?.join(', ') || '',
    preferredPlayTimes: profile.preferredPlayTimes || [],
    skillLevels: profile.skillLevels || {}
  });

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setFormData(prev => ({ ...prev, homeLatitude: lat, homeLongitude: lon }));
      
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          setFormData(prev => ({ ...prev, location: data.features[0].place_name }));
        }
      } catch (err) {
        console.error('Failed to reverse geocode', err);
      }
    }, () => {
      alert('Unable to retrieve your location');
    });
  };

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', {
        ...formData,
        favoriteGames: formData.favoriteGames.split(',').map(s => s.trim()).filter(Boolean),
        age: formData.age ? parseInt(formData.age.toString()) : null,
        homeLatitude: formData.homeLatitude ? parseFloat(formData.homeLatitude.toString()) : null,
        homeLongitude: formData.homeLongitude ? parseFloat(formData.homeLongitude.toString()) : null,
      });
      await syncUser();
      setIsEditing(false);
      alert('Profile updated!');
    } catch (error: any) {
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      await api.post('/auth/upgrade-organizer');
      await syncUser();
      alert('Successfully upgraded to Organizer!');
    } catch (error: any) {
      alert('Failed to upgrade: ' + error.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!user || !profile) {
    return <div className="p-8 text-center">Loading profile data...</div>;
  }

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['userPosts', user.id],
    queryFn: async () => (await api.get(`/users/${user.id}/posts`)).data,
    enabled: activeTab === 'posts'
  });

  const { data: likes, isLoading: loadingLikes } = useQuery({
    queryKey: ['userLikes', user.id],
    queryFn: async () => (await api.get(`/users/${user.id}/likes`)).data,
    enabled: activeTab === 'likes'
  });

  const { data: replies, isLoading: loadingReplies } = useQuery({
    queryKey: ['userReplies', user.id],
    queryFn: async () => (await api.get(`/users/${user.id}/replies`)).data,
    enabled: activeTab === 'replies'
  });

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ['userMatches', user.id],
    queryFn: async () => (await api.get(`/users/${user.id}/matches`)).data,
    enabled: activeTab === 'matches'
  });

  const badges = user.badges || [];
  const memberships = user.communityMemberships || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors">Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">Edit Profile</button>
          )}
          <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">Sign Out</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img 
              src={firebaseUser?.photoURL || 'https://via.placeholder.com/100'} 
              alt="Avatar" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 shrink-0"
            />
            <div className="break-all sm:break-normal">
              <h2 className="text-xl sm:text-2xl font-semibold">{user.name} {badges.some((b: any) => b.badge?.name === 'VENUE_OWNER') && '🏟️'}</h2>
              <p className="text-gray-500 text-sm sm:text-base break-all">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">{user.role}</span>
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Rep: {user.reputation}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {user.role !== 'ORGANIZER' && user.role !== 'ADMIN' && (
              <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap">
                {isUpgrading ? 'Upgrading...' : 'Become an Organizer'}
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea className="w-full p-2 border rounded" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Location</label>
                <div className="flex gap-2">
                  <input type="text" className="w-full p-2 border rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  <button type="button" onClick={handleUseLocation} className="whitespace-nowrap px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center gap-2 transition-colors">
                    <Navigation className="w-4 h-4" /> Use My Location
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Home Latitude</label>
                <input type="number" step="any" className="w-full p-2 border rounded" value={formData.homeLatitude} onChange={e => setFormData({...formData, homeLatitude: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Home Longitude</label>
                <input type="number" step="any" className="w-full p-2 border rounded" value={formData.homeLongitude} onChange={e => setFormData({...formData, homeLongitude: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Favorite Games (comma separated)</label>
              <input type="text" className="w-full p-2 border rounded" value={formData.favoriteGames} onChange={e => setFormData({...formData, favoriteGames: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Play Times</label>
              <div className="flex gap-4">
                {['Weekdays', 'Weekends', 'Mornings', 'Evenings'].map(time => (
                  <label key={time} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.preferredPlayTimes.includes(time)} onChange={e => {
                      if (e.target.checked) setFormData({...formData, preferredPlayTimes: [...formData.preferredPlayTimes, time]});
                      else setFormData({...formData, preferredPlayTimes: formData.preferredPlayTimes.filter((t: string) => t !== time)});
                    }} /> {time}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">About Me</h3>
                <p className="text-gray-700 dark:text-gray-300">{profile.bio || 'No bio provided yet.'}</p>
                <p className="text-sm mt-2 text-gray-500">Age: {profile.age || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Location & Times</h3>
                <p className="text-gray-700 dark:text-gray-300">📍 {profile.location || 'Not specified.'}</p>
                <p className="text-sm text-gray-500 mt-1">Play times: {profile.preferredPlayTimes?.join(', ') || 'Any'}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
              <h3 className="font-semibold text-lg mb-2">Favorite Games</h3>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteGames?.length > 0 ? (
                  profile.favoriteGames.map((sport: string) => (
                    <span key={sport} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                      {sport} {profile.skillLevels?.[sport] ? `(${profile.skillLevels[sport]})` : ''}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No games selected.</p>
                )}
              </div>
            </div>

            {badges.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-2">Badges & Achievements</h3>
                <div className="flex flex-wrap gap-4">
                  {badges.map((b: any) => (
                    <div key={b.id} className="flex flex-col items-center p-2 bg-yellow-50 rounded-lg" title={b.badge?.description}>
                      <span className="text-2xl">{b.badge?.icon}</span>
                      <span className="text-xs font-semibold mt-1 text-yellow-800">{b.badge?.name?.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memberships.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-2">Clubs & Communities</h3>
                <div className="flex flex-wrap gap-2">
                  {memberships.map((m: any) => (
                    <span key={m.id} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                      {m.community?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden mt-8">
        <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('posts')} 
            className={`min-w-[120px] flex-1 py-4 font-medium text-center ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            My Posts
          </button>
          <button 
            onClick={() => setActiveTab('likes')} 
            className={`min-w-[120px] flex-1 py-4 font-medium text-center ${activeTab === 'likes' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            Liked Posts
          </button>
          <button 
            onClick={() => setActiveTab('replies')} 
            className={`min-w-[120px] flex-1 py-4 font-medium text-center ${activeTab === 'replies' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            My Comments
          </button>
          <button 
            onClick={() => setActiveTab('matches')} 
            className={`min-w-[120px] flex-1 py-4 font-medium text-center ${activeTab === 'matches' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            My Matches
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {loadingPosts ? <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : 
                posts?.length > 0 ? posts.map((post: any) => <PostCard key={post.id} post={post} />) : 
                <p className="text-gray-500 text-center py-4">No posts found.</p>}
            </div>
          )}
          
          {activeTab === 'likes' && (
            <div className="space-y-4">
              {loadingLikes ? <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : 
                likes?.length > 0 ? likes.map((post: any) => <PostCard key={post.id} post={post} />) : 
                <p className="text-gray-500 text-center py-4">No liked posts.</p>}
            </div>
          )}

          {activeTab === 'replies' && (
            <div className="space-y-4">
              {loadingReplies ? <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : 
                replies?.length > 0 ? replies.map((reply: any) => (
                  <div key={reply.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-gray-100">{reply.content}</p>
                    <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      Replied on: <span className="italic truncate max-w-xs">{reply.post?.content}</span>
                    </div>
                  </div>
                )) : <p className="text-gray-500 text-center py-4">No comments found.</p>}
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4">
              {loadingMatches ? <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : 
                matches?.length > 0 ? matches.map((match: any) => (
                  <div key={match.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-shadow">
                    <div>
                      <h4 className="font-bold text-lg">{match.title}</h4>
                      <p className="text-sm text-gray-500">{new Date(match.date).toLocaleDateString()} at {match.location}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">{match.sport}</span>
                        {match.creatorId === user.id && <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">Organizer</span>}
                      </div>
                    </div>
                    <Link to={`/matches/${match.id}`} className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
                      View Match
                    </Link>
                  </div>
                )) : <p className="text-gray-500 text-center py-4">No matches found.</p>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
