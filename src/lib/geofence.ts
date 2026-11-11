export const PPD_TUARAN_OFFICE = {
  name: 'Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)',
  address: 'Peti Surat 590, 89208 Tuaran, Sabah',
  latitude: 6.1341200,
  longitude: 116.2305400,
  radius_meters: 150,
};

/**
 * Calculates Haversine distance between two geographic coordinates in meters.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Checks if a point is within a geofenced radius
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number
): { inside: boolean; distanceMeters: number } {
  const distance = calculateHaversineDistanceMeters(userLat, userLng, targetLat, targetLng);
  return {
    inside: distance <= radiusMeters,
    distanceMeters: distance,
  };
}

/**
 * Validate radius within 50 to 500 meters
 */
export function isValidGeofenceRadius(radius: number): boolean {
  return Number.isInteger(radius) && radius >= 50 && radius <= 500;
}

