import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Trophy, Building, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface MapPoint {
  id: string;
  title: string;
  category: string;
  type: 'MATCH' | 'TURF';
  lat: number;
  lng: number;
  price?: number;
  locationText: string;
  availableSlots?: number;
  totalSlots?: number;
  ownerName?: string;
  rating?: number;
}

interface NearbyMapProps {
  userLocation: { lat: number; lng: number } | null;
  items: MapPoint[];
  radius: number;
}

export default function NearbyMap({ userLocation, items, radius }: NearbyMapProps) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  const centerLat = userLocation?.lat || 17.3968;
  const centerLng = userLocation?.lng || 78.4888;

  const [viewState, setViewState] = useState({
    latitude: centerLat,
    longitude: centerLng,
    zoom: 12
  });

  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  const hasMapbox = Boolean(mapboxToken && mapboxToken !== 'your-mapbox-token');

  return (
    <div className="w-full bg-white border border-[#E6E8EC] rounded-2xl overflow-hidden shadow-sm space-y-0">
      {/* Map Header Controls */}
      <div className="p-4 bg-white border-b border-[#E6E8EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2457D6]/10 text-[#2457D6] flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#172033] uppercase tracking-wider">
              Nearby Active Radar ({items.length} items within {radius}km)
            </h3>
            <p className="text-xs text-[#667085]">
              {userLocation ? 'Using live GPS coordinates' : 'Centered near Hyderabad Center'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-[#FF7A3D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A3D]" /> Active Matches
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-[#2457D6]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2457D6]" /> Turf Owners & Venues
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-[#F7F7F2]">
        {hasMapbox ? (
          <Map
            {...viewState}
            onMove={(evt: any) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={mapboxToken}
          >
            {/* User GPS Location Marker */}
            {userLocation && (
              <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#2457D6] opacity-40" />
                  <div className="w-5 h-5 rounded-full bg-[#2457D6] border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-black">
                    YOU
                  </div>
                </div>
              </Marker>
            )}

            {/* Item Markers */}
            {items.map((item) => (
              <Marker
                key={item.id}
                latitude={item.lat}
                longitude={item.lng}
                anchor="bottom"
              >
                <div 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedPoint(item);
                  }}
                  className={`cursor-pointer transform hover:scale-110 transition-transform p-1.5 rounded-xl border-2 shadow-md flex items-center gap-1 text-xs font-black text-white ${
                    item.type === 'MATCH'
                      ? 'bg-[#FF7A3D] border-white'
                      : 'bg-[#2457D6] border-white'
                  }`}
                >
                  {item.type === 'MATCH' ? (
                    <Trophy className="w-3.5 h-3.5" />
                  ) : (
                    <Building className="w-3.5 h-3.5" />
                  )}
                  <span>{item.category}</span>
                </div>
              </Marker>
            ))}

            {/* Active Popup */}
            {selectedPoint && (
              <Popup
                latitude={selectedPoint.lat}
                longitude={selectedPoint.lng}
                anchor="bottom"
                onClose={() => setSelectedPoint(null)}
                closeOnClick={false}
                className="z-50"
              >
                <div className="p-2 max-w-[220px] font-sans text-[#172033]">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    selectedPoint.type === 'MATCH' ? 'bg-[#FF7A3D]/10 text-[#FF7A3D]' : 'bg-[#2457D6]/10 text-[#2457D6]'
                  }`}>
                    {selectedPoint.type === 'MATCH' ? 'Active Match' : 'Turf Venue'}
                  </span>
                  <h4 className="font-extrabold text-xs mt-1 text-[#172033] line-clamp-1">{selectedPoint.title}</h4>
                  <p className="text-[11px] text-[#667085] mt-0.5">{selectedPoint.locationText}</p>
                  
                  {selectedPoint.price && (
                    <p className="text-xs font-bold text-[#2457D6] mt-1">₹{selectedPoint.price} / hr</p>
                  )}

                  {selectedPoint.type === 'MATCH' ? (
                    <Link
                      to={`/match/${selectedPoint.id}`}
                      className="mt-2 block w-full text-center py-1.5 bg-[#FF7A3D] text-white font-bold text-[11px] rounded-lg uppercase tracking-wider"
                    >
                      View Match Details
                    </Link>
                  ) : (
                    <Link
                      to={`/create-match?venue=${encodeURIComponent(selectedPoint.title)}`}
                      className="mt-2 block w-full text-center py-1.5 bg-[#2457D6] text-white font-bold text-[11px] rounded-lg uppercase tracking-wider"
                    >
                      Book Turf / Host Here
                    </Link>
                  )}
                </div>
              </Popup>
            )}
          </Map>
        ) : (
          /* Fallback Visual Interactive Location Grid */
          <div className="w-full h-full p-4 flex flex-col justify-between relative bg-gradient-to-br from-[#F7F7F2] to-[#E6E8EC]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2457D6_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#2457D6] bg-white/90 px-3 py-1 rounded-full border border-[#E6E8EC] shadow-sm">
                📍 Interactive Location Grid
              </span>
              <span className="text-xs font-semibold text-[#667085] bg-white/90 px-3 py-1 rounded-full border border-[#E6E8EC]">
                {items.length} Active Venues & Games Nearby
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[280px] p-1">
              {items.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedPoint(item)}
                  className={`p-3 rounded-xl border bg-white shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedPoint?.id === item.id ? 'border-[#2457D6] ring-2 ring-[#2457D6]/20' : 'border-[#E6E8EC]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      item.type === 'MATCH' ? 'bg-[#FF7A3D]/10 text-[#FF7A3D]' : 'bg-[#2457D6]/10 text-[#2457D6]'
                    }`}>
                      {item.category}
                    </span>
                    {item.price && (
                      <span className="text-xs font-extrabold text-[#2457D6]">₹{item.price}/hr</span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-[#172033] line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-[#667085] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#2457D6] shrink-0" />
                    <span className="truncate">{item.locationText}</span>
                  </p>
                  {item.ownerName && (
                    <p className="text-[10px] text-[#98A2B3] mt-1 font-semibold">Owner: {item.ownerName}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="relative z-10 text-center text-[11px] text-[#667085] font-semibold">
              Select any location card above to preview details & book
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
