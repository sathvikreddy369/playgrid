import React, { useState } from 'react';
import { useCreateMatch } from '../hooks/useMatches';
import { useCommunities } from '../hooks/useCommunities';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const CreateMatch = () => {
  const navigate = useNavigate();
  const createMatch = useCreateMatch();
  
  // To allow linking a match to a community if they manage/belong to one
  // We'll just fetch verified communities for simplicity, though real app would filter by user's communities
  const { data: communities } = useCommunities('VERIFIED');

  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    date: '',
    location: '',
    latitude: '',
    longitude: '',
    maxPlayers: 10,
    costPerPerson: '',
    skillLevel: 'ALL',
    communityId: ''
  });

  const [mapsLink, setMapsLink] = useState('');

  const handleMapsLinkChange = (e: any) => {
    const link = e.target.value;
    setMapsLink(link);
    
    // Parse Google maps link
    // e.g. https://www.google.com/maps/@17.3966,78.4889,15z
    // or https://maps.google.com/?q=17.3966,78.4889
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    
    const match = link.match(regex) || link.match(qRegex);
    if (match) {
      setFormData(prev => ({
        ...prev,
        latitude: match[1],
        longitude: match[2]
      }));
    }
  };

  const handleChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      costPerPerson: formData.costPerPerson ? parseFloat(formData.costPerPerson) : undefined
    };

    createMatch.mutate(payload as any, {
      onSuccess: () => {
        navigate('/matches');
      },
      onError: (err: any) => alert(err.response?.data?.error || 'Failed to create match')
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organize a Game</h1>
        <p className="text-gray-500 mb-8">Set up a match and let players in your area join you.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Match Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. Sunday Morning Football 5v5" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
              <input required name="sport" value={formData.sport} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. Football" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input required type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
              <input required name="location" value={formData.location} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="Venue name or address" />
            </div>

            <div className="md:col-span-2 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
               <label className="block text-sm font-medium text-gray-700 mb-1">Paste Google Maps Link (Auto-extracts coordinates)</label>
               <input type="url" value={mapsLink} onChange={handleMapsLinkChange} className="w-full border rounded-lg px-4 py-2 mb-4" placeholder="https://www.google.com/maps/..." />
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                   <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="17.3966" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                   <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="78.4889" />
                 </div>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Spots *</label>
              <input required type="number" min="2" max="100" name="maxPlayers" value={formData.maxPlayers} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" />
              <p className="text-xs text-gray-500 mt-1">Openings available: {formData.maxPlayers}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Head (₹) - Optional</label>
              <input type="number" min="0" name="costPerPerson" value={formData.costPerPerson} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. 150" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select name="skillLevel" value={formData.skillLevel} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 bg-white">
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="PRO">Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Community (Optional)</label>
              <select name="communityId" value={formData.communityId} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 bg-white">
                <option value="">None (Global Match)</option>
                {communities?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button type="submit" disabled={createMatch.isPending} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium">
              {createMatch.isPending ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
