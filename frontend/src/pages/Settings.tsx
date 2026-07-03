import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Save, User, MapPin, Gamepad2, Activity, Clock, Shield, Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';

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
            <Textarea
              label="Bio"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              rows={3}
            />

            <Input
              label="Location"
              startIcon={<MapPin className="w-4 h-4 text-green-500" />}
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Neighborhood"
            />

            <Input
              label="Sports Interests (comma separated)"
              startIcon={<Activity className="w-4 h-4 text-orange-500" />}
              type="text"
              value={formData.sports}
              onChange={e => setFormData({ ...formData, sports: e.target.value })}
              placeholder="Cricket, Football, Tennis"
            />

            <Input
              label="Favorite Games (comma separated)"
              startIcon={<Gamepad2 className="w-4 h-4 text-purple-500" />}
              type="text"
              value={formData.favoriteGames}
              onChange={e => setFormData({ ...formData, favoriteGames: e.target.value })}
              placeholder="FIFA, Call of Duty, etc."
            />

            <Input
              label="Preferred Play Times (comma separated)"
              startIcon={<Clock className="w-4 h-4 text-blue-500" />}
              type="text"
              value={formData.preferredPlayTimes}
              onChange={e => setFormData({ ...formData, preferredPlayTimes: e.target.value })}
              placeholder="Weekends, Evenings"
            />
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
              <Select 
                value={formData.privacySettings.profileVisibility}
                onChange={e => setFormData(f => ({...f, privacySettings: {...f.privacySettings, profileVisibility: e.target.value}}))}
                className="w-40"
              >
                <option value="PUBLIC">Public</option>
                <option value="FRIENDS">Friends Only</option>
                <option value="PRIVATE">Private</option>
              </Select>
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
            <Button 
              type="submit" 
              isLoading={updateProfileMutation.isPending}
              className="rounded-full px-6 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> 
              Save Settings
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
