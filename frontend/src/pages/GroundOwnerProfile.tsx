import { useState, useEffect } from 'react';
import MapboxPicker from '../components/MapboxPicker';
import ImageUpload from '../components/ImageUpload';
import { Save, Store, MapPin, DollarSign, Building } from 'lucide-react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function GroundOwnerProfile() {
  const navigate = useNavigate();
  const [venueName, setVenueName] = useState('');
  const [description, setDescription] = useState('');
  
  // Venue specific

  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [pricing, setPricing] = useState('');
  const [venueType, setVenueType] = useState('Box Cricket');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data.profile) {
          setVenueName(res.data.profile.venueName || '');
          setDescription(res.data.profile.bio || '');
          setVenueType(res.data.profile.venueType || 'Box Cricket');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleAddAmenity = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && amenityInput.trim()) {
      e.preventDefault();
      if (!amenities.includes(amenityInput.trim())) {
        setAmenities([...amenities, amenityInput.trim()]);
      }
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post('/users/profile', {
        name: venueName || 'Ground Owner',
        venueName: venueName || undefined,
        venueType: venueType || undefined,
        venueAddress: description || undefined,
        bio: description || undefined
      });
      navigate('/profile');
    } catch (err: any) {
      console.error('Failed to save venue profile', err);
      setError(err?.response?.data?.error || 'Failed to save venue profile');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] p-4 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-[#E6E8EC] rounded-xl overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className="h-32 lg:h-48 bg-[#F7F7F2] border-b border-[#E6E8EC] relative flex items-center justify-center">
            <Store className="w-16 h-16 text-[#2457D6]/40 absolute" />
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-[#172033] uppercase tracking-wider">
                  <Building className="w-5 h-5 text-[#2457D6]" />
                  Venue Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#667085] ml-1">Venue Name</label>
                    <input 
                      type="text" 
                      value={venueName}
                      onChange={e => setVenueName(e.target.value)}
                      className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors"
                      placeholder="e.g. Skyline Box Cricket"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#667085] ml-1">Venue Type</label>
                      <select 
                        value={venueType}
                        onChange={e => setVenueType(e.target.value)}
                        className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:border-[#2457D6] transition-colors appearance-none font-semibold"
                      >
                        <option>Box Cricket</option>
                        <option>Football Turf</option>
                        <option>Badminton Court</option>
                        <option>Swimming Pool</option>
                        <option>Pickleball Court</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#667085] ml-1">Price per Hour (₹)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
                        <input 
                          type="number" 
                          value={pricing}
                          onChange={e => setPricing(e.target.value)}
                          className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl pl-9 pr-4 py-2.5 mt-1 focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors font-semibold"
                          placeholder="1200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#667085] ml-1">Description</label>
                    <textarea 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors resize-none placeholder:text-[#98A2B3]"
                      placeholder="Describe your venue, rules, etc..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-[#172033] uppercase tracking-wider">
                  <MapPin className="w-5 h-5 text-[#2457D6]" />
                  Location
                </h2>
                <MapboxPicker />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold mb-4 text-[#172033] uppercase tracking-wider">Venue Images</h2>
                <p className="text-sm text-[#667085] mb-4">Upload up to 3 high-quality images of your venue.</p>
                <ImageUpload maxImages={3} onUpload={() => {}} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold mb-4 mt-8 text-[#172033] uppercase tracking-wider">Amenities</h2>
                <div>
                  <label className="text-xs font-bold text-[#667085] ml-1">Add Amenity (Press Enter)</label>
                  <input 
                    type="text" 
                    value={amenityInput}
                    onChange={e => setAmenityInput(e.target.value)}
                    onKeyDown={handleAddAmenity}
                    className="w-full bg-white border border-[#E6E8EC] text-[#172033] rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors placeholder:text-[#98A2B3]"
                    placeholder="e.g. Parking, Washroom, Floodlights"
                  />
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {amenities.map(amenity => (
                      <span key={amenity} className="px-3 py-1 bg-[#F7F7F2] border border-[#E6E8EC] text-[#2457D6] rounded-full text-xs font-bold flex items-center gap-1">
                        {amenity}
                        <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-[#172033]">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E6E8EC]">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-[#2457D6] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors uppercase tracking-wider disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Venue Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
