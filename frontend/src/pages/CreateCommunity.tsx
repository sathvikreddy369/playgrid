import React, { useState } from 'react';
import { useCreateCommunity } from '../hooks/useCommunities';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';

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
      <Button 
        variant="ghost"
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-muted hover:text-foreground font-semibold text-sm mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

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
              <Input
                label="Community Name *"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bangalore Weekend Footballers"
              />
            </div>

            <div>
              <Textarea
                label="Description *"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-2">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Select 
                  label="Privacy *"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                >
                  <option value="PUBLIC">Public (Anyone can join)</option>
                  <option value="PRIVATE">Private (Requires approval)</option>
                </Select>
              </div>
              
              <div>
                <Input
                  label="Base Location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Koramangala, Bangalore"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Sports (Comma separated)"
                  type="text"
                  value={sportsInput}
                  onChange={(e) => setSportsInput(e.target.value)}
                  placeholder="e.g. Cricket, Football"
                />
              </div>
              <div>
                <Input
                  label="Tags (Comma separated)"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
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
                <Input
                  label="Avatar URL"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Input
                  label="Cover Image URL"
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <Textarea
                label="Community Rules (One per line)"
                rows={4}
                value={rulesInput}
                onChange={(e) => setRulesInput(e.target.value)}
                placeholder="1. Be respectful to others&#10;2. No spamming"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-border flex justify-end">
            <Button
              type="submit"
              isLoading={createCommunity.isPending}
              disabled={!name.trim() || !description.trim()}
              className="w-full md:w-auto px-8 rounded-xl font-bold"
            >
              Submit for Verification
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
