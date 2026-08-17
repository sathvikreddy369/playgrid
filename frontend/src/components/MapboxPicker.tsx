import { useState, useCallback } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface MapboxPickerProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  readOnly?: boolean;
}

export default function MapboxPicker({ 
  onLocationSelect, 
  initialLat = 17.3850, 
  initialLng = 78.4867,
  readOnly = false
}: MapboxPickerProps) {
  const [viewState, setViewState] = useState({
    longitude: initialLng,
    latitude: initialLat,
    zoom: 13
  });
  
  const [marker, setMarker] = useState<{lat: number, lng: number} | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const handleMapClick = useCallback((e: any) => {
    if (readOnly) return;
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    setMarker({ lat, lng });
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  }, [onLocationSelect, readOnly]);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  if (!mapboxToken || mapboxToken === 'your-mapbox-token') {
    return (
      <div className="w-full h-full min-h-[220px] bg-[#F7F7F2] rounded-xl border border-[#E6E8EC] flex items-center justify-center text-[#667085] text-xs font-semibold">
        <p>📍 Location Coordinates: {initialLat.toFixed(4)}, {initialLng.toFixed(4)}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[220px] rounded-xl overflow-hidden border border-[#E6E8EC] relative shadow-sm">
      <Map
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        cursor={readOnly ? 'grab' : 'crosshair'}
      >
        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <div className="animate-bounce">
              <MapPin className="text-[#FF7A3D] fill-[#FF7A3D]/20 w-8 h-8 drop-shadow-md" />
            </div>
          </Marker>
        )}
      </Map>
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[11px] font-bold px-3 py-1 rounded-lg border border-[#E6E8EC] text-[#172033] shadow-sm">
        {readOnly ? '📍 Venue Location Pin' : 'Click map to set venue coordinates'}
      </div>
    </div>
  );
}
