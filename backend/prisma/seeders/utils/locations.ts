export const HYDERABAD_AREAS = [
  { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { name: 'Kondapur', lat: 17.4622, lng: 78.3568 },
  { name: 'Madhapur', lat: 17.4483, lng: 78.3915 },
  { name: 'Financial District', lat: 17.4156, lng: 78.3430 },
  { name: 'Nanakramguda', lat: 17.4150, lng: 78.3411 },
  { name: 'Tellapur', lat: 17.4646, lng: 78.2936 },
  { name: 'Narsingi', lat: 17.3910, lng: 78.3524 },
  { name: 'Miyapur', lat: 17.4933, lng: 78.3431 },
  { name: 'Kukatpally', lat: 17.4875, lng: 78.3953 },
  { name: 'Jubilee Hills', lat: 17.4326, lng: 78.4071 },
  { name: 'Banjara Hills', lat: 17.4154, lng: 78.4411 },
  { name: 'Ameerpet', lat: 17.4375, lng: 78.4482 },
  { name: 'Begumpet', lat: 17.4447, lng: 78.4664 },
  { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
  { name: 'LB Nagar', lat: 17.3457, lng: 78.5522 },
  { name: 'Uppal', lat: 17.3984, lng: 78.5583 },
  { name: 'Dilsukhnagar', lat: 17.3685, lng: 78.5316 },
  { name: 'Manikonda', lat: 17.4042, lng: 78.3846 },
  { name: 'Hitech City', lat: 17.4435, lng: 78.3772 },
  { name: 'Tolichowki', lat: 17.3953, lng: 78.4116 },
];

export const getRandomLocation = () => {
  return HYDERABAD_AREAS[Math.floor(Math.random() * HYDERABAD_AREAS.length)];
};

export const getNearbylocation = (baseLat: number, baseLng: number, radiusKm: number = 2) => {
  // 1 degree is approx 111km
  const radiusInDegrees = radiusKm / 111;
  const latOffset = (Math.random() - 0.5) * 2 * radiusInDegrees;
  const lngOffset = (Math.random() - 0.5) * 2 * radiusInDegrees;
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  };
};
