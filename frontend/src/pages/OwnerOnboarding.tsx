import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import MapboxPicker from '../components/MapboxPicker';

export default function OwnerOnboarding() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Box Cricket',
    sports: ['Cricket'],
    address: '',
    locality: 'Narayanguda',
    latitude: 17.3968,
    longitude: 78.4888,
    pricePerHour: '1200',
    ownerPhone: '',
    amenities: 'Floodlights, Parking, Changing Rooms, Drinking Water'
  });

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Box Cricket',
    'Football Turf',
    'Badminton Court',
    'Swimming Pool',
    'Pickleball Court',
    'E-Sports Lounge'
  ];

  const localities = [
    'Narayanguda',
    'Himayatnagar',
    'Basheerbagh',
    'Abids',
    'RTC X Roads',
    'Kachiguda',
    'Gachibowli',
    'Madhapur',
    'Kondapur',
    'Jubilee Hills',
    'Banjara Hills'
  ];

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      alert('Maximum 5 venue photos allowed.');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'gamevia_preset');

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        return data.secure_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800';
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      console.error('Image upload failed', err);
      setImages([...images, 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800']);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.locality || !form.pricePerHour) {
      setError('Please fill in venue name, locality, and hourly pricing.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/venues/application', {
        ...form,
        latitude: parseFloat(form.latitude as any),
        longitude: parseFloat(form.longitude as any),
        pricePerHour: parseFloat(form.pricePerHour),
        sports: [form.category.split(' ')[0] || 'Sports'],
        amenities: form.amenities.split(',').map(a => a.trim()),
        images
      });

      alert('Venue application submitted! An Admin will review your listing shortly.');
      navigate('/owner/dashboard');
    } catch (err: any) {
      console.error('Failed to submit venue application:', err);
      setError(err?.response?.data?.error || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-24 sm:pb-12">
      <header className="border-b border-[#E6E8EC] bg-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#667085] hover:text-[#172033]">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2457D6] text-white flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-[#172033] uppercase">Partner as Venue Owner</span>
          </div>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-[#E6E8EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-extrabold text-[#2457D6] uppercase tracking-wider bg-[#2457D6]/10 px-3 py-1 rounded-full border border-[#2457D6]/20">
              🏢 Expand Your Sports Business
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] mt-3">Register Your Turf or Arena</h1>
            <p className="text-xs text-[#667085] mt-1">
              List your box cricket turf, badminton courts, or swimming pool on GAMEVIA for player bookings and host game rooms.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Info */}
            <div className="space-y-4 pt-4 border-t border-[#E6E8EC]">
              <h2 className="text-sm font-extrabold uppercase text-[#172033]">1. Venue Information</h2>
              
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Venue / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Box Cricket & Turf"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Venue Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Hourly Pricing (₹/hr) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1200"
                    value={form.pricePerHour}
                    onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Venue Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your turf turf quality, floodlights, parking, amenities..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:border-[#2457D6]"
                />
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-4 pt-4 border-t border-[#E6E8EC]">
              <h2 className="text-sm font-extrabold uppercase text-[#172033]">2. Location & Address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Locality / Area *</label>
                  <select
                    value={form.locality}
                    onChange={(e) => {
                      const loc = e.target.value;
                      let coords = { lat: 17.3968, lng: 78.4888 };
                      if (loc === 'Himayatnagar') coords = { lat: 17.4018, lng: 78.4815 };
                      if (loc === 'Basheerbagh') coords = { lat: 17.3995, lng: 78.4760 };
                      if (loc === 'Gachibowli') coords = { lat: 17.4401, lng: 78.3489 };
                      if (loc === 'Madhapur') coords = { lat: 17.4483, lng: 78.3915 };
                      setForm({ ...form, locality: loc, latitude: coords.lat, longitude: coords.lng });
                    }}
                    className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                  >
                    {localities.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Owner Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={form.ownerPhone}
                    onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Full Street Address</label>
                <input
                  type="text"
                  placeholder="Street No. 4, Near Old MLA Quarters, Narayanguda, Hyderabad"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                />
              </div>

              {/* Mapbox Location Picker */}
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-2">Pinpoint Coordinates on Map</label>
                <MapboxPicker
                  initialLat={form.latitude}
                  initialLng={form.longitude}
                  onLocationSelect={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
                />
              </div>
            </div>

            {/* Photos & Amenities */}
            <div className="space-y-4 pt-4 border-t border-[#E6E8EC]">
              <h2 className="text-sm font-extrabold uppercase text-[#172033]">3. Business Photos & Amenities</h2>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-2">Venue Images (Max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleCloudinaryUpload}
                  disabled={uploading}
                  className="block w-full text-xs text-[#667085] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2457D6] file:text-white hover:file:bg-[#1D4ED8]"
                />
                {uploading && <p className="text-xs text-[#2457D6] mt-2 font-bold">Uploading images to Cloudinary...</p>}

                {images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                    {images.map((url, index) => (
                      <div key={index} className="relative shrink-0">
                        <img src={url} alt="Venue preview" className="w-20 h-20 object-cover rounded-xl border border-[#E6E8EC]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Floodlights, Parking, Changing Rooms, Drinking Water"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2457D6]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-colors"
            >
              {loading ? 'Submitting Application...' : 'Submit Application for Admin Review'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
