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
    if (readOnly) return; // Prevent pin manipulation in read-only mode
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
      <div className="w-full h-full min-h-[220px] bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
        <p>Mapbox Token Required. Add VITE_MAPBOX_TOKEN to .env</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[220px] rounded-xl overflow-hidden border border-zinc-800 relative shadow-inner shadow-black/50">
      <Map
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        cursor={readOnly ? 'grab' : 'crosshair'}
      >
        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <div className="animate-bounce">
              <MapPin className="text-red-500 fill-red-500/20 w-8 h-8" />
            </div>
          </Marker>
        )}
      </Map>
      <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300 shadow-lg">
        {readOnly ? '📍 Match Venue Location' : 'Click map to set venue coordinates'}
      </div>
    </div>
  );
}
