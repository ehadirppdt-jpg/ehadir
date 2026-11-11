// e-HADIR TUARAN — GEOFENCE & GPS VERIFICATION ENGINE (NO GOOGLE MAPS API)
// Standards: Leaflet.js + OpenStreetMap (OSM) + Browser Geolocation API + Haversine Formula

export const PPD_TUARAN_OFFICE = {
  name: 'Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)',
  address: 'Peti Surat 590, 89208 Tuaran, Sabah',
  latitude: 6.1341200,
  longitude: 116.2305400,
  radius_meters: 150,
};

// Configurable OpenStreetMap Raster Tile URL and Attribution
export const OSM_TILE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OSM_TILE_URL) ||
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

export interface DeviceGpsPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface ServerLocationVerificationResult {
  authorized: boolean;
  location_type: 'SCHOOL' | 'PPD_TUARAN' | 'UNAUTHORIZED';
  location_name: string;
  distance_meters: number;
  allowed_radius_meters: number;
  accuracy_meters: number;
  is_at_ppd: boolean;
  is_at_school: boolean;
  rejection_reason?: string;
  risk_alerts?: string[];
}

/**
 * Calculates distance between two GPS coordinates using the Haversine formula in meters.
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
 * Validates configured radius between 50 to 500 meters
 */
export function isValidGeofenceRadius(radius: number): boolean {
  return Number.isInteger(radius) && radius >= 50 && radius <= 500;
}

/**
 * Obtains device location via Browser Geolocation API (navigator.geolocation).
 * Strictly enforced security requirements:
 * 1. Checks HTTPS context
 * 2. Blocks offline clocking
 * 3. Enforces high accuracy
 * 4. Catches permission denied, timeout, unavailable
 */
export function getDeviceCurrentPosition(): Promise<DeviceGpsPayload> {
  return new Promise((resolve, reject) => {
    // 1. Check browser environment support
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Pelayar web anda tidak menyokong fungsi pengesanan GPS Geolocation.'));
    }

    // 2. Enforce HTTPS security requirement (allow localhost during development)
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return reject(
        new Error('Sambungan selamat HTTPS diperlukan untuk mengakses koordinat GPS peranti.')
      );
    }

    // 3. Prevent offline clocking
    if (typeof navigator.onLine !== 'undefined' && !navigator.onLine) {
      return reject(
        new Error('Peranti anda berada dalam mod luar talian (offline). Sambungan internet diperlukan untuk merekod kehadiran.')
      );
    }

    // 4. Request location only during active attendance event
    const options: PositionOptions = {
      enableHighAccuracy: true, // Request GPS chip instead of cellular estimation
      timeout: 12000,           // 12 seconds max wait
      maximumAge: 0,            // Do not use cached/stale GPS fixes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Anti-spoofing & accuracy gate (reject poor GPS fixes > 65 meters)
        if (accuracy > 65) {
          return reject(
            new Error(
              `Ketepatan GPS peranti anda terlalu rendah (${Math.round(accuracy)}m > 65m). Sila pastikan anda berada di kawasan lapang atau buka aplikasi peta untuk menentukur semula GPS.`
            )
          );
        }

        resolve({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp || Date.now(),
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error(
                'Kebenaran akses GPS telah ditolak. Sila benarkan akses lokasi pada tetapan pelayar anda untuk mengesahkan kehadiran.'
              )
            );
            break;
          case error.POSITION_UNAVAILABLE:
            reject(
              new Error('Isyarat koordinat GPS tidak dapat dikesan. Sila hidupkan fungsi Lokasi (GPS) pada peranti anda.')
            );
            break;
          case error.TIMEOUT:
            reject(
              new Error('Masa pengesanan GPS tamat. Sila pastikan isyarat satelit GPS stabil dan cuba lagi.')
            );
            break;
          default:
            reject(new Error(`Ralat Geolocation tidak dijangka: ${error.message}`));
        }
      },
      options
    );
  });
}

/**
 * Validates attendance location against authorised boundaries:
 * 1. Assigned School Location
 * 2. Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)
 */
export function verifyAttendanceGeofence(params: {
  userLatitude: number;
  userLongitude: number;
  accuracy: number;
  schoolLatitude: number;
  schoolLongitude: number;
  schoolRadiusMeters: number;
  schoolName: string;
}): ServerLocationVerificationResult {
  const {
    userLatitude,
    userLongitude,
    accuracy,
    schoolLatitude,
    schoolLongitude,
    schoolRadiusMeters,
    schoolName,
  } = params;

  // 1. Check distance to Assigned School
  const distanceToSchool = calculateHaversineDistanceMeters(
    userLatitude,
    userLongitude,
    schoolLatitude,
    schoolLongitude
  );
  const isAtSchool = distanceToSchool <= schoolRadiusMeters;

  // 2. Check distance to PPD Tuaran HQ
  const distanceToPpd = calculateHaversineDistanceMeters(
    userLatitude,
    userLongitude,
    PPD_TUARAN_OFFICE.latitude,
    PPD_TUARAN_OFFICE.longitude
  );
  const isAtPpd = distanceToPpd <= PPD_TUARAN_OFFICE.radius_meters;

  // 3. Evaluate results
  if (isAtSchool) {
    return {
      authorized: true,
      location_type: 'SCHOOL',
      location_name: schoolName,
      distance_meters: distanceToSchool,
      allowed_radius_meters: schoolRadiusMeters,
      accuracy_meters: Math.round(accuracy),
      is_at_school: true,
      is_at_ppd: false,
    };
  }

  if (isAtPpd) {
    return {
      authorized: true,
      location_type: 'PPD_TUARAN',
      location_name: PPD_TUARAN_OFFICE.name,
      distance_meters: distanceToPpd,
      allowed_radius_meters: PPD_TUARAN_OFFICE.radius_meters,
      accuracy_meters: Math.round(accuracy),
      is_at_school: false,
      is_at_ppd: true,
    };
  }

  // Location outside all authorised boundaries
  return {
    authorized: false,
    location_type: 'UNAUTHORIZED',
    location_name: 'Luar Perimeter Kehadiran Sah',
    distance_meters: Math.min(distanceToSchool, distanceToPpd),
    allowed_radius_meters: schoolRadiusMeters,
    accuracy_meters: Math.round(accuracy),
    is_at_school: false,
    is_at_ppd: false,
    rejection_reason: `Lokasi anda (${userLatitude.toFixed(6)}, ${userLongitude.toFixed(6)}) berada di luar radius sah ${schoolName} (${distanceToSchool}m > ${schoolRadiusMeters}m) dan PPD Tuaran (${distanceToPpd}m > ${PPD_TUARAN_OFFICE.radius_meters}m).`,
    risk_alerts: ['GEOFENCE_BREACH'],
  };
}
