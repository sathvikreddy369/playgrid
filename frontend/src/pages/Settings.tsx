import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Save, User, MapPin, Gamepad2, Activity, Clock, Shield, Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    bio: '',
    avatarUrl: '',
    location: '',
    sports: '',
    favoriteGames: '',
    preferredPlayTimes: '',
    privacySettings: {
      profileVisibility: 'PUBLIC',
      showActivity: true,
      showCommunities: true
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        location: profile.location || '',
        sports: profile.sports?.join(', ') || '',
        favoriteGames: profile.favoriteGames?.join(', ') || '',
        preferredPlayTimes: profile.preferredPlayTimes?.join(', ') || '',
        privacySettings: (profile as any).privacySettings || { profileVisibility: 'PUBLIC', showActivity: true, showCommunities: true }
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      bio: formData.bio,
      avatarUrl: formData.avatarUrl,
      location: formData.location,
      sports: formData.sports.split(',').map(s => s.trim()).filter(Boolean),
      favoriteGames: formData.favoriteGames.split(',').map(s => s.trim()).filter(Boolean),
      preferredPlayTimes: formData.preferredPlayTimes.split(',').map(s => s.trim()).filter(Boolean),
      privacySettings: formData.privacySettings,
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const res = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, avatarUrl: res.data.url }));
      toast.success('Image uploaded! Click Save to apply.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-8 text-foreground">Settings</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 border-b border-border pb-6">
            <div className="relative group cursor-pointer w-20 h-20 shrink-0">
              <img 
                src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} 
                alt="Avatar" 
                className={`w-20 h-20 rounded-full bg-surface border-2 border-border object-cover ${isUploading ? 'opacity-50' : ''}`}
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1.5">
                <User className="w-4 h-4 text-primary-500" /> Bio
              </label>
              <textarea 
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                rows={3}
                placeholder="Tell others about yourself..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1.5">
                <MapPin className="w-4 h-4 text-green-500" /> Location
              </label>
              <input 
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="City, Neighborhood"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1.5">
                <Activity className="w-4 h-4 text-orange-500" /> Sports Interests (comma separated)
              </label>
              <input 
                type="text"
                value={formData.sports}
                onChange={e => setFormData({ ...formData, sports: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Cricket, Football, Tennis"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1.5">
                <Gamepad2 className="w-4 h-4 text-purple-500" /> Favorite Games (comma separated)
              </label>
              <input 
                type="text"
                value={formData.favoriteGames}
                onChange={e => setFormData({ ...formData, favoriteGames: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="FIFA, Call of Duty, etc."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1.5">
                <Clock className="w-4 h-4 text-blue-500" /> Preferred Play Times (comma separated)
              </label>
              <input 
                type="text"
                value={formData.preferredPlayTimes}
                onChange={e => setFormData({ ...formData, preferredPlayTimes: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Weekends, Evenings"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" /> Privacy & Visibility
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">Profile Visibility</p>
                <p className="text-xs text-muted">Who can see your profile details.</p>
              </div>
              <select 
                value={formData.privacySettings.profileVisibility}
                onChange={e => setFormData(f => ({...f, privacySettings: {...f.privacySettings, profileVisibility: e.target.value}}))}
                className="bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="FRIENDS">Friends Only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">Show Activity Timeline</p>
                <p className="text-xs text-muted">Allow others to see your recent actions.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.privacySettings.showActivity} onChange={e => setFormData(f => ({...f, privacySettings: {...f.privacySettings, showActivity: e.target.value === 'on'}}))} />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">Show Communities</p>
                <p className="text-xs text-muted">Display communities you are a member of.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.privacySettings.showCommunities} onChange={e => setFormData(f => ({...f, privacySettings: {...f.privacySettings, showCommunities: e.target.value === 'on'}}))} />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> 
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
