import React, { useState } from 'react';
import { useCreateCommunity } from '../hooks/useCommunities';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateCommunity = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [sportsInput, setSportsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [rulesInput, setRulesInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const navigate = useNavigate();
  const createCommunity = useCreateCommunity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const sports = sportsInput.split(',').map(s => s.trim()).filter(Boolean);
    const tags = tagsInput.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    const rules = rulesInput.split('\n').map(r => r.trim()).filter(Boolean);

    createCommunity.mutate(
      { 
        name, 
        description, 
        location,
        privacy,
        sports: sports.length > 0 ? sports : undefined,
        tags: tags.length > 0 ? tags : undefined,
        rules: rules.length > 0 ? rules : undefined,
        avatarUrl: avatarUrl || undefined,
        coverImage: coverImage || undefined
      },
      {
        onSuccess: () => {
          toast.success('Community created! Pending admin verification.');
          navigate('/communities');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || 'Failed to create community');
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-muted hover:text-foreground font-semibold text-sm mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card-premium p-8 md:p-10 bg-surface">
        <h1 className="text-3xl font-black text-foreground mb-2">Create Community</h1>
        <p className="text-muted text-sm mb-10">
          Build a space for your local players to gather, discuss, and play.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-2">Basic Info</h3>
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Community Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-primary w-full"
                placeholder="e.g. Bangalore Weekend Footballers"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-primary w-full resize-none"
                placeholder="What is this community about?"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-2">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Privacy *</label>
                <select 
                  className="input-primary w-full appearance-none"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                >
                  <option value="PUBLIC">Public (Anyone can join)</option>
                  <option value="PRIVATE">Private (Requires approval)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Base Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-primary w-full"
                  placeholder="e.g. Koramangala, Bangalore"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Sports (Comma separated)</label>
                <input
                  type="text"
                  value={sportsInput}
                  onChange={(e) => setSportsInput(e.target.value)}
                  className="input-primary w-full"
                  placeholder="e.g. Cricket, Football"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="input-primary w-full"
                  placeholder="e.g. beginners, weekend, casual"
                />
              </div>
            </div>
          </div>

          {/* Media & Rules */}
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-2">Branding & Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Avatar URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="input-primary w-full"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Cover Image URL</label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="input-primary w-full"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Community Rules (One per line)</label>
              <textarea
                rows={4}
                value={rulesInput}
                onChange={(e) => setRulesInput(e.target.value)}
                className="input-primary w-full resize-none"
                placeholder="1. Be respectful to others&#10;2. No spamming"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={createCommunity.isPending || !name.trim() || !description.trim()}
              className="btn-primary w-full md:w-auto"
            >
              {createCommunity.isPending ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
