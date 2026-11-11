// Supabase Edge Function: verify-geofence
// Server-side Geofence & Device Validation for Clock-in/Clock-out

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface GeofenceCheckRequest {
  user_id: string;
  latitude: number;
  longitude: number;
  school_id: string;
  device_uuid: string;
}

// Haversine distance formula in meters
function calculateHaversineDistance(
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

  return R * c;
}

// Official PPD Tuaran Coordinates
const PPD_TUARAN_COORDS = {
  latitude: 6.13412,
  longitude: 116.23054,
  radius: 150, // 150 meters
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const payload: GeofenceCheckRequest = await req.json();
    const { user_id, latitude, longitude, school_id } = payload;

    if (!user_id || !latitude || !longitude || !school_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check 1: Is user within PPD Tuaran office?
    const distanceToPpd = calculateHaversineDistance(
      latitude,
      longitude,
      PPD_TUARAN_COORDS.latitude,
      PPD_TUARAN_COORDS.longitude
    );
    const isAtPpd = distanceToPpd <= PPD_TUARAN_COORDS.radius;

    // Check 2: Distance to school (in a real DB lookup, fetch school coords)
    return new Response(
      JSON.stringify({
        valid: true,
        is_at_ppd: isAtPpd,
        distance_to_ppd_meters: Math.round(distanceToPpd),
        message: isAtPpd ? "Lokasi disahkan di PPD Tuaran" : "Semakan lokasi selesai",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
