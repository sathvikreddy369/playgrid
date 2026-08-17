import { useState, useEffect } from 'react';
import { MapPin, Building, Star, ExternalLink, Calendar, Users, DollarSign, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { getGoogleMapsDirectionsUrl } from '../utils/location';

export default function GroundOwnerProfile() {
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchOwnerVenue();
  }, []);

  const fetchOwnerVenue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/venues/my-venue');
      setVenue(res.data.venue);
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error('Failed to load owner venue:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] p-4 lg:p-8 flex items-center justify-center">
        <div className="bg-white border border-[#E6E8EC] rounded-2xl p-8 max-w-md text-center shadow-sm space-y-4">
          <Building className="w-12 h-12 text-[#2457D6] mx-auto" />
          <h2 className="text-xl font-black text-[#172033] uppercase">No Registered Venue Found</h2>
          <p className="text-xs text-[#667085]">
            You have not registered a sports venue or ground yet. Partner with GAMEVIA to list your venue and get instant bookings!
          </p>
          <Link
            to="/owner/register"
            className="inline-block px-6 py-3 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-sm"
          >
            Register Your Venue Now
          </Link>
        </div>
      </div>
    );
  }

  const mapsUrl = getGoogleMapsDirectionsUrl(venue.latitude, venue.longitude);

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] p-4 lg:p-8 font-sans pb-24 sm:pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Status Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
          venue.status === 'APPROVED' ? 'bg-[#16803C]/10 border-[#16803C]/20 text-[#16803C]' :
          venue.status === 'PENDING_APPROVAL' ? 'bg-[#FF7A3D]/10 border-[#FF7A3D]/20 text-[#FF7A3D]' :
          'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
            {venue.status === 'APPROVED' ? (
              <CheckCircle className="w-6 h-6 shrink-0 text-[#16803C]" />
            ) : venue.status === 'PENDING_APPROVAL' ? (
              <Clock className="w-6 h-6 shrink-0 text-[#FF7A3D]" />
            ) : (
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
            )}
            <div>
              <span className="text-xs font-black uppercase tracking-wider">
                Venue Status: {venue.status === 'APPROVED' ? 'LIVE ON GAMEVIA' : venue.status === 'PENDING_APPROVAL' ? 'UNDER ADMIN REVIEW' : venue.status}
              </span>
              <p className="text-xs font-medium text-[#172033]/80 mt-0.5">
                {venue.status === 'APPROVED' ? 'Your venue is public and receiving match bookings.' :
                 venue.status === 'PENDING_APPROVAL' ? 'Your venue application was submitted and is pending verification by Platform Admin.' :
                 venue.rejectionReason || 'Listing status update from moderation.'}
              </p>
            </div>
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-[#E6E8EC] hover:bg-gray-50 text-[#2457D6] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shrink-0 uppercase tracking-wider"
            >
              Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Business Analytics Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#172033] uppercase tracking-wider">Business Analytics & Metrics</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E6E8EC] p-5 rounded-2xl shadow-sm">
              <Calendar className="w-6 h-6 text-[#2457D6] mb-2" />
              <p className="text-2xl font-black text-[#172033]">{analytics?.totalMatchesHosted || 0}</p>
              <p className="text-xs text-[#667085] font-semibold">Total Matches Hosted</p>
            </div>

            <div className="bg-white border border-[#E6E8EC] p-5 rounded-2xl shadow-sm">
              <Users className="w-6 h-6 text-[#FF7A3D] mb-2" />
              <p className="text-2xl font-black text-[#172033]">{analytics?.totalParticipants || 0}</p>
              <p className="text-xs text-[#667085] font-semibold">Confirmed Players</p>
            </div>

            <div className="bg-white border border-[#E6E8EC] p-5 rounded-2xl shadow-sm">
              <DollarSign className="w-6 h-6 text-[#16803C] mb-2" />
              <p className="text-2xl font-black text-[#172033]">₹{analytics?.estimatedMatchValue || 0}</p>
              <p className="text-xs text-[#667085] font-semibold">Estimated Match Value</p>
            </div>

            <div className="bg-white border border-[#E6E8EC] p-5 rounded-2xl shadow-sm">
              <Star className="w-6 h-6 text-[#FF7A3D] fill-[#FF7A3D] mb-2" />
              <p className="text-2xl font-black text-[#172033]">{analytics?.averageRating || 5.0} ★</p>
              <p className="text-xs text-[#667085] font-semibold">Average Rating ({analytics?.reviewCount || 0} Reviews)</p>
            </div>
          </div>
        </div>

        {/* Venue Profile Details Card */}
        <div className="bg-white border border-[#E6E8EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E6E8EC] pb-6">
            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-[#2457D6]/10 text-[#2457D6]">
                {venue.category}
              </span>
              <h1 className="text-2xl font-black text-[#172033] mt-2">{venue.name}</h1>
              <p className="text-xs text-[#667085] mt-1 flex items-center gap-1.5 font-semibold">
                <MapPin className="w-4 h-4 text-[#2457D6]" /> {venue.locality} • ₹{venue.pricePerHour}/hr
              </p>
            </div>
            <Link
              to="/create-match"
              className="px-5 py-2.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-xl shadow-sm uppercase tracking-wider"
            >
              + Host Match at Venue
            </Link>
          </div>

          <p className="text-xs text-[#667085] leading-relaxed bg-[#F7F7F2] p-4 rounded-xl">
            {venue.description || 'No venue description added.'}
          </p>

          {venue.images && venue.images.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#172033] uppercase mb-3">Venue Photos</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {venue.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt="Venue" className="w-32 h-24 object-cover rounded-xl border border-[#E6E8EC]" />
                ))}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="pt-6 border-t border-[#E6E8EC] space-y-4">
            <h3 className="text-sm font-black text-[#172033] uppercase tracking-wider">
              Customer Reviews ({venue.venueReviews?.length || 0})
            </h3>

            {venue.venueReviews && venue.venueReviews.length > 0 ? (
              <div className="space-y-3">
                {venue.venueReviews.map((rev: any) => (
                  <div key={rev.id} className="bg-[#F7F7F2] p-4 rounded-xl border border-[#E6E8EC]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#172033]">{rev.author?.profile?.name || rev.author?.email}</span>
                      <span className="text-xs font-bold text-[#FF7A3D]">{rev.rating} ★</span>
                    </div>
                    <p className="text-xs text-[#667085]">{rev.comment || 'No text review'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#667085]">No reviews submitted for this venue yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
