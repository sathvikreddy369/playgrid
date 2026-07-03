import React, { useState } from 'react';
import { useCreateVenue } from '../hooks/useVenues';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../providers/AuthProvider';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';

export const CreateVenue = () => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const createGround = useCreateVenue();

 const [formData, setFormData] = useState({
 name: '',
 location: '',
 pricing: '',
 contactPhone: '',
 contactEmail: '',
 website: '',
 description: '',
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
        <p className="text-muted">Only Organizers can list venues.</p>
        <Button onClick={() => navigate('/profile')} variant="ghost" className="mt-4 text-primary-600 hover:text-primary-700">
          Upgrade to Organizer in Profile
        </Button>
      </div>
    );
  }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
 toast.success('Venue listing submitted for verification.');
 navigate('/venues');
 },
 onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to submit')
 }
 );
 };

  return (
  <div className="max-w-3xl mx-auto py-8 px-4">
  <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-foreground mb-6">
  <ArrowLeft className="w-5 h-5" /> Back
  </Button>

  <div className="bg-surface rounded-2xl shadow-soft border border-border p-8">
  <h1 className="text-3xl font-black text-foreground mb-2">List Your Venue</h1>
  <p className="text-muted text-sm mb-8">Add your sports venue to Playgrid. Listings require admin approval.</p>

  <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
  <Input required id="name" name="name" label="Venue Name *" value={formData.name} onChange={handleChange} placeholder="e.g. Play Arena" />
  </div>
  <div>
  <Input required id="location" name="location" label="Location *" value={formData.location} onChange={handleChange} placeholder="e.g. HSR Layout, Bangalore" />
  </div>
  <div>
  <Input id="pricing" name="pricing" label="Pricing Guide" value={formData.pricing} onChange={handleChange} placeholder="e.g. ₹1500 / hr" />
  </div>
  <div>
  <Input id="contactPhone" name="contactPhone" label="Contact Phone" value={formData.contactPhone} onChange={handleChange} placeholder="+91..." />
  </div>
  <div>
  <Input type="email" id="contactEmail" name="contactEmail" label="Contact Email" value={formData.contactEmail} onChange={handleChange} placeholder="hello@playarena.com" />
  </div>
  <div>
  <Input type="url" id="website" name="website" label="Website URL" value={formData.website} onChange={handleChange} placeholder="https://playarena.com" />
  </div>
  </div>

  <div>
  <Textarea id="description" name="description" label="Description" value={formData.description} onChange={handleChange} rows={4} placeholder="Tell players about the venue..." />
  </div>

 <hr className="my-6" />

 {/* Photos */}
  <div>
  <div className="flex gap-2 items-end">
  <div className="flex-1">
  <Input id="photoUrl" label="Photo URLs (Gallery)" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://image-url.jpg" />
  </div>
  <Button type="button" aria-label="Add photo URL" onClick={() => handleAddItem(setPhotos, photoUrl, setPhotoUrl)} className="h-10 px-4 rounded-xl"><Plus className="w-5 h-5" /></Button>
  </div>
 <div className="flex flex-wrap gap-2 mt-3">
 {photos.map((p, i) => (
 <div key={i} className="relative w-24 h-24 rounded overflow-hidden group">
 <img src={p} alt="Venue photo" className="w-full h-full object-cover" />
 <button type="button" aria-label="Remove photo" onClick={() => handleRemoveItem(setPhotos, i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
 </div>
 ))}
 </div>
 </div>

 {/* Sports */}
  <div>
  <div className="flex gap-2 items-end">
  <div className="flex-1">
  <Input id="sportInput" label="Supported Sports" value={sportInput} onChange={e => setSportInput(e.target.value)} placeholder="e.g. Football, Cricket" />
  </div>
  <Button type="button" aria-label="Add sport" onClick={() => handleAddItem(setSports, sportInput, setSportInput)} className="h-10 px-4 rounded-xl"><Plus className="w-5 h-5" /></Button>
  </div>
 <div className="flex flex-wrap gap-2 mt-2">
 {sports.map((s, i) => (
 <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
 {s} <button type="button" aria-label={`Remove sport ${s}`} onClick={() => handleRemoveItem(setSports, i)}><X className="w-3 h-3" /></button>
 </span>
 ))}
 </div>
 </div>

 {/* Amenities */}
  <div>
  <div className="flex gap-2 items-end">
  <div className="flex-1">
  <Input id="amenityInput" label="Amenities" value={amenityInput} onChange={e => setAmenityInput(e.target.value)} placeholder="e.g. Floodlights, Parking, Washrooms" />
  </div>
  <Button type="button" aria-label="Add amenity" onClick={() => handleAddItem(setAmenities, amenityInput, setAmenityInput)} className="h-10 px-4 rounded-xl"><Plus className="w-5 h-5" /></Button>
  </div>
 <div className="flex flex-wrap gap-2 mt-2">
 {amenities.map((a, i) => (
 <span key={i} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
 {a} <button type="button" aria-label={`Remove amenity ${a}`} onClick={() => handleRemoveItem(setAmenities, i)}><X className="w-3 h-3" /></button>
 </span>
 ))}
 </div>
 </div>

  <div className="pt-6 flex justify-end">
  <Button type="submit" isLoading={createGround.isPending} className="px-8 rounded-xl font-bold">
  Submit Listing
  </Button>
  </div>
 </form>
 </div>
 </div>
 );
};
