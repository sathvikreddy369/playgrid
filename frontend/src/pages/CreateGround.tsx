import React, { useState } from 'react';
import { useCreateGround } from '../hooks/useGrounds';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export const CreateGround = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createGround = useCreateGround();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pricing: '',
    contactPhone: '',
  });

  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const [sportInput, setSportInput] = useState('');
  const [sports, setSports] = useState<string[]>([]);

  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-500">Only Organizers can list grounds.</p>
        <button onClick={() => navigate('/profile')} className="text-blue-600 mt-4">Upgrade to Organizer in Profile</button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    if (!item.trim()) return;
    setter(prev => [...prev, item.trim()]);
    setInput('');
  };

  const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;

    createGround.mutate(
      { ...formData, photos, sports, amenities },
      {
        onSuccess: () => {
          alert('Ground listing submitted for verification.');
          navigate('/grounds');
        },
        onError: (err: any) => alert(err.response?.data?.error || 'Failed to submit')
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">List Your Ground</h1>
        <p className="text-gray-500 mb-8">Add your sports venue to Playgrid. Listings require admin approval.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. Play Arena" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input required name="location" value={formData.location} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. HSR Layout, Bangalore" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Guide</label>
              <input name="pricing" value={formData.pricing} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="e.g. ₹1500 / hr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" placeholder="+91..." />
            </div>
          </div>

          <hr className="my-6" />

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URLs (Gallery)</label>
            <div className="flex gap-2">
              <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="flex-1 border rounded-lg px-4 py-2" placeholder="https://image-url.jpg" />
              <button type="button" onClick={() => handleAddItem(setPhotos, photoUrl, setPhotoUrl)} className="bg-gray-100 px-4 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {photos.map((p, i) => (
                <div key={i} className="relative w-24 h-24 rounded overflow-hidden group">
                  <img src={p} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveItem(setPhotos, i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Sports */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supported Sports</label>
            <div className="flex gap-2">
              <input value={sportInput} onChange={e => setSportInput(e.target.value)} className="flex-1 border rounded-lg px-4 py-2" placeholder="e.g. Football, Cricket" />
              <button type="button" onClick={() => handleAddItem(setSports, sportInput, setSportInput)} className="bg-gray-100 px-4 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sports.map((s, i) => (
                <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {s} <button type="button" onClick={() => handleRemoveItem(setSports, i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <div className="flex gap-2">
              <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} className="flex-1 border rounded-lg px-4 py-2" placeholder="e.g. Floodlights, Parking, Washrooms" />
              <button type="button" onClick={() => handleAddItem(setAmenities, amenityInput, setAmenityInput)} className="bg-gray-100 px-4 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((a, i) => (
                <span key={i} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  {a} <button type="button" onClick={() => handleRemoveItem(setAmenities, i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button type="submit" disabled={createGround.isPending} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium">
              {createGround.isPending ? 'Submitting...' : 'Submit Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
