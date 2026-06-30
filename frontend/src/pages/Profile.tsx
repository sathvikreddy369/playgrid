import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { signOut } from '../lib/firebase';
import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '../components/PostCard';
import { PostSkeleton, Skeleton } from '../components/Skeleton';
import { MapPin, Navigation, Edit3, LogOut, Check, Trophy, Users, ShieldAlert, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Profile = () => {
  const { user, profile, firebaseUser, syncUser } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'replies' | 'matches'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: profile?.bio || '',
    location: profile?.location || '',
    homeLatitude: profile?.homeLatitude || '',
    homeLongitude: profile?.homeLongitude || '',
    age: profile?.age || '',
    favoriteGames: profile?.favoriteGames?.join(', ') || '',
    preferredPlayTimes: profile?.preferredPlayTimes || [],
    skillLevels: profile?.skillLevels || {}
  });

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported');
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
    });
  };

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', {
        ...formData,
        favoriteGames: formData.favoriteGames.split(',').map((s: string) => s.trim()).filter(Boolean),
        age: formData.age ? parseInt(formData.age.toString()) : null,
        homeLatitude: formData.homeLatitude ? parseFloat(formData.homeLatitude.toString()) : null,
        homeLongitude: formData.homeLongitude ? parseFloat(formData.homeLongitude.toString()) : null,
      });
      await syncUser();
      setIsEditing(false);
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
    return (
      <div className="max-w-4xl mx-auto w-full min-h-screen">
        <Skeleton className="h-48 w-full" />
        <div className="px-6 relative -top-12">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-background" />
          <Skeleton className="h-8 w-48 mt-4" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
    );
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
    <div className="w-full flex flex-col min-h-screen bg-background">
      {/* Banner */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-primary-600 via-purple-500 to-indigo-600 relative shrink-0">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 relative -top-16 pb-20">
        
        {/* Profile Header Card */}
        <div className="card p-6 md:p-8 pt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative">
            <div className="flex flex-col relative -top-12 md:-top-16">
              <img 
                src={firebaseUser?.photoURL || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                alt="Avatar" 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface shadow-md object-cover bg-surface"
              />
              <div className="mt-4">
                <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
                  {user.name} 
                  {badges.some((b: any) => b.badge?.name === 'VENUE_OWNER') && <span title="Venue Owner">🏟️</span>}
                </h1>
                <p className="text-muted font-medium">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-md flex items-center gap-1">
                    {user.role === 'ADMIN' ? <ShieldAlert className="w-3 h-3" /> : user.role === 'ORGANIZER' ? <Zap className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                    {user.role}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-md flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Rep: {user.reputation}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:pb-4 w-full md:w-auto mt-4 md:mt-0">
              {user.role === 'USER' && (
                <button onClick={handleUpgrade} disabled={isUpgrading} className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                  {isUpgrading ? 'Upgrading...' : 'Become Organizer'}
                </button>
              )}
              {isEditing ? (
                <button onClick={handleSave} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-bold transition-all active:scale-95">
                  <Check className="w-4 h-4" /> Save
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-bold transition-all active:scale-95">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
              <button onClick={handleLogout} className="p-2 bg-surface border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-border mt-4 pt-6 space-y-5"
              >
                <div className="space-y-1">
                  <label htmlFor="bio" className="text-xs font-bold text-muted uppercase tracking-wider">Bio</label>
                  <textarea id="bio" className="w-full bg-surface border border-border rounded-xl p-3 text-foreground focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label htmlFor="location" className="text-xs font-bold text-muted uppercase tracking-wider">Location</label>
                    <div className="flex gap-2">
                      <input id="location" type="text" className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-primary-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                      <button type="button" aria-label="Use current location" onClick={handleUseLocation} className="px-3 py-2 bg-surface border border-border hover:bg-border rounded-xl flex items-center justify-center transition-colors text-muted hover:text-foreground">
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="age" className="text-xs font-bold text-muted uppercase tracking-wider">Age</label>
                    <input id="age" type="number" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-primary-500 outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="homeLatitude" className="text-xs font-bold text-muted uppercase tracking-wider">Home Latitude</label>
                    <input id="homeLatitude" type="number" step="any" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-primary-500 outline-none" value={formData.homeLatitude} onChange={e => setFormData({...formData, homeLatitude: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="homeLongitude" className="text-xs font-bold text-muted uppercase tracking-wider">Home Longitude</label>
                    <input id="homeLongitude" type="number" step="any" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-primary-500 outline-none" value={formData.homeLongitude} onChange={e => setFormData({...formData, homeLongitude: e.target.value})} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="favoriteGames" className="text-xs font-bold text-muted uppercase tracking-wider">Favorite Games (comma separated)</label>
                    <input id="favoriteGames" type="text" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-primary-500 outline-none" value={formData.favoriteGames} onChange={e => setFormData({...formData, favoriteGames: e.target.value})} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Preferred Play Times</label>
                    <div className="flex flex-wrap gap-3">
                      {['Weekdays', 'Weekends', 'Mornings', 'Evenings'].map(time => {
                        const isSelected = formData.preferredPlayTimes.includes(time);
                        return (
                          <label key={time} className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${isSelected ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-300' : 'bg-surface border-border text-muted hover:border-primary-300'}`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isSelected} 
                              onChange={e => {
                                if (e.target.checked) setFormData({...formData, preferredPlayTimes: [...formData.preferredPlayTimes, time]});
                                else setFormData({...formData, preferredPlayTimes: formData.preferredPlayTimes.filter((t: string) => t !== time)});
                              }} 
                            />
                            {time}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="mt-6 border-t border-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-muted" /> About</h3>
                    <p className="text-muted text-[15px] leading-relaxed whitespace-pre-wrap">{profile.bio || 'No bio provided yet.'}</p>
                    {profile.age && <p className="text-sm mt-3 text-muted"><strong>Age:</strong> {profile.age}</p>}
                  </div>
                  
                  {profile.favoriteGames?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-muted" /> Favorite Games</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.favoriteGames.map((sport: string) => (
                          <span key={sport} className="px-3 py-1 bg-surface border border-border rounded-lg text-sm font-medium text-foreground">
                            {sport} {profile.skillLevels?.[sport] ? <span className="text-muted ml-1 font-normal">({profile.skillLevels[sport]})</span> : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-muted" /> Location & Times</h3>
                    <p className="text-foreground text-[15px]">{profile.location || 'Not specified.'}</p>
                    {profile.preferredPlayTimes?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {profile.preferredPlayTimes.map((time: string) => (
                          <span key={time} className="px-2 py-1 bg-surface border border-border rounded text-xs font-medium text-muted">{time}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {(badges.length > 0 || memberships.length > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                      {badges.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3">Badges</h3>
                          <div className="flex flex-wrap gap-2">
                            {badges.map((b: any) => (
                              <div key={b.id} className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center text-xl cursor-help transition-transform hover:scale-110" title={b.badge?.description}>
                                {b.badge?.icon}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {memberships.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3">Communities</h3>
                          <div className="flex flex-wrap gap-2">
                            {memberships.map((m: any) => (
                              <Link key={m.id} to={`/communities/${m.communityId}`} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors">
                                {m.community?.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Tabs */}
        <div className="mt-8">
          <div className="flex gap-6 border-b border-border overflow-x-auto no-scrollbar">
            {[
              { id: 'posts', label: 'Posts' },
              { id: 'likes', label: 'Likes' },
              { id: 'replies', label: 'Replies' },
              { id: 'matches', label: 'Matches' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-sm font-bold transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {activeTab === 'posts' && (
                  loadingPosts ? <PostSkeleton /> : 
                  posts?.length > 0 ? posts.map((post: any) => <PostCard key={post.id} post={post} />) : 
                  <EmptyState text="No posts found." />
                )}
                
                {activeTab === 'likes' && (
                  loadingLikes ? <PostSkeleton /> : 
                  likes?.length > 0 ? likes.map((post: any) => <PostCard key={post.id} post={post} />) : 
                  <EmptyState text="No liked posts." />
                )}

                {activeTab === 'replies' && (
                  loadingReplies ? <PostSkeleton /> : 
                  replies?.length > 0 ? replies.map((reply: any) => (
                    <div key={reply.id} className="card p-4">
                      <p className="text-foreground text-[15px]">{reply.content}</p>
                      <div className="text-sm text-muted mt-3 pt-3 border-t border-border flex items-center gap-2">
                        Replied on: <span className="italic truncate flex-1 bg-surface px-2 py-1 rounded-md">{reply.post?.content}</span>
                      </div>
                    </div>
                  )) : <EmptyState text="No comments found." />
                )}

                {activeTab === 'matches' && (
                  loadingMatches ? <PostSkeleton /> : 
                  matches?.length > 0 ? matches.map((match: any) => (
                    <Link key={match.id} to={`/matches/${match.id}`} className="card p-5 flex justify-between items-center group">
                      <div>
                        <h4 className="font-bold text-foreground text-lg group-hover:text-primary-500 transition-colors">{match.title}</h4>
                        <p className="text-sm text-muted mt-1">{new Date(match.date).toLocaleDateString()} at {match.location}</p>
                        <div className="flex gap-2 mt-3">
                          <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-1 bg-surface border border-border rounded-md">{match.sport}</span>
                          {match.creatorId === user.id && <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 rounded-md">Organizer</span>}
                        </div>
                      </div>
                      <div className="text-muted group-hover:text-primary-500 transition-transform group-hover:translate-x-1">
                        <Navigation className="w-5 h-5 rotate-90" />
                      </div>
                    </Link>
                  )) : <EmptyState text="No matches found." />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <div className="text-center py-16 bg-surface/50 border border-border border-dashed rounded-2xl">
    <p className="text-muted font-medium">{text}</p>
  </div>
);
