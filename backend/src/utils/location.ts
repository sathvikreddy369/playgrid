export function isValidCoordinates(lat: number | null | undefined, lng: number | null | undefined): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function getGoogleMapsDirectionsUrl(lat: number | null | undefined, lng: number | null | undefined): string | null {
  if (!isValidCoordinates(lat, lng)) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

export function formatDistance(distanceKm: number | null | undefined): string | null {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return null;
  return `${distanceKm.toFixed(1)} km away`;
}
