import { useState } from 'react';
import { motion } from 'framer-motion';
import MapboxPicker from '../components/MapboxPicker';
import ImageUpload from '../components/ImageUpload';
import { Save, Store, MapPin, DollarSign, Building } from 'lucide-react';

export default function GroundOwnerProfile() {
  const [venueName, setVenueName] = useState('');
  const [description, setDescription] = useState('');
  // const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Venue specific
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [pricing, setPricing] = useState('');
  const [venueType, setVenueType] = useState('Box Cricket');

  const [saving, setSaving] = useState(false);

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
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Ground Profile saved successfully!');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header Banner */}
          <div className="h-32 lg:h-48 bg-gradient-to-r from-emerald-600/40 to-teal-600/40 relative flex items-center justify-center">
            <Store className="w-16 h-16 text-emerald-400/50 absolute" />
          </div>

          <form onSubmit={handleSave} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-400" />
                  Venue Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 ml-1">Venue Name</label>
                    <input 
                      type="text" 
                      value={venueName}
                      onChange={e => setVenueName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                      placeholder="e.g. Skyline Box Cricket"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-400 ml-1">Venue Type</label>
                      <select 
                        value={venueType}
                        onChange={e => setVenueType(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none appearance-none"
                      >
                        <option>Box Cricket</option>
                        <option>Football Turf</option>
                        <option>Badminton Court</option>
                        <option>Swimming Pool</option>
                        <option>Pickleball Court</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-400 ml-1">Price per Hour (₹)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="number" 
                          value={pricing}
                          onChange={e => setPricing(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 mt-1 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                          placeholder="1200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-400 ml-1">Description</label>
                    <textarea 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none resize-none"
                      placeholder="Describe your venue, rules, etc..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  Location
                </h2>
                {/* <MapboxPicker onLocationSelect={(lat, lng) => setLocation({lat, lng})} /> */}
                <MapboxPicker />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Venue Images</h2>
                <p className="text-sm text-zinc-400 mb-4">Upload up to 3 high-quality images of your venue.</p>
                <ImageUpload maxImages={3} onUpload={() => {}} />
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 mt-8">Amenities</h2>
                <div>
                  <label className="text-xs font-medium text-zinc-400 ml-1">Add Amenity (Press Enter)</label>
                  <input 
                    type="text" 
                    value={amenityInput}
                    onChange={e => setAmenityInput(e.target.value)}
                    onKeyDown={handleAddAmenity}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none"
                    placeholder="e.g. Parking, Washroom, Floodlights"
                  />
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {amenities.map(amenity => (
                      <span key={amenity} className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-xs flex items-center gap-1">
                        {amenity}
                        <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-white">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-medium shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
        </motion.div>
      </div>
    </div>
  );
}
