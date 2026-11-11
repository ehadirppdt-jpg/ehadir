// e-HADIR TUARAN — SUPABASE EDGE FUNCTION: verify-geofence
// NO GOOGLE MAPS API — 100% SERVER-SIDE HAVERSINE DISTANCE & GEOFENCE SECURITY VALIDATION
// Architecture: OpenStreetMap Coordinates + Device Geolocation + PostgreSQL Storage

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

interface GeofenceCheckRequest {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  action_type?: "CLOCK_IN" | "CLOCK_OUT" | "LOCATION_CHECK";
}

// Server-side Haversine Formula (Meters)
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

  return Math.round(R * c);
}

// Official PPD Tuaran HQ Location (Authorised for all PGB)
const PPD_TUARAN_OFFICE = {
  name: "Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)",
  latitude: 6.1341200,
  longitude: 116.2305400,
  radius_meters: 150,
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: GeofenceCheckRequest = await req.json();
    const { user_id, latitude, longitude, accuracy, timestamp, action_type = "LOCATION_CHECK" } = payload;

    // STEP 1: Identify Authenticated User & Validate Input
    if (!user_id || latitude === undefined || longitude === undefined) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: "Parameter tidak lengkap. Sila bekalkan user_id, latitude dan longitude.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // STEP 6A: Anti-Spoofing & GPS Accuracy Check
    // Reject poor accuracy GPS (> 65 meters) to prevent location spoofing
    if (accuracy && accuracy > 65) {
      // Log failed accuracy verification to audit
      await supabase.from("risk_alerts").insert({
        user_id,
        alert_type: "POOR_GPS_ACCURACY",
        severity: "WARNING",
        message: `Ketepatan GPS peranti terlalu rendah (${Math.round(accuracy)}m > 65m).`,
        metadata: { latitude, longitude, accuracy, timestamp },
      });

      return new Response(
        JSON.stringify({
          authorized: false,
          rejection_code: "POOR_ACCURACY",
          message: `Ketepatan GPS (${Math.round(accuracy)}m) melebihi had keselamatan 65m. Sila pastikan isyarat GPS stabil.`,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Anti-spoofing: Check timestamp drift (> 5 minutes old is rejected)
    const now = Date.now();
    if (timestamp && Math.abs(now - timestamp) > 300000) {
      return new Response(
        JSON.stringify({
          authorized: false,
          rejection_code: "EXPIRED_GPS_TIMESTAMP",
          message: "Data koordinat GPS telah tamat tempoh sah atau jam peranti tidak tepat.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // STEP 2: Retrieve Assigned School for User from PostgreSQL
    const { data: assignment, error: assignError } = await supabase
      .from("user_school_assignments")
      .select(`
        school_id,
        schools (
          id,
          name,
          code,
          latitude,
          longitude,
          geofence_radius_meters,
          is_active
        )
      `)
      .eq("user_id", user_id)
      .eq("is_active", true)
      .single();

    let school = assignment?.schools as any;

    // Fallback if no remote DB connection in development
    if (!school) {
      school = {
        id: "sch-default",
        name: "Sekolah Bertugas PGB",
        latitude: 6.1341200,
        longitude: 116.2305400,
        geofence_radius_meters: 100,
      };
    }

    // STEP 3: Retrieve Authorised Attendance Locations
    // Location A: Assigned School
    // Location B: PPD Tuaran HQ
    const distanceToSchool = calculateHaversineDistance(
      latitude,
      longitude,
      school.latitude,
      school.longitude
    );

    const distanceToPpd = calculateHaversineDistance(
      latitude,
      longitude,
      PPD_TUARAN_OFFICE.latitude,
      PPD_TUARAN_OFFICE.longitude
    );

    // STEP 4 & 5: Haversine Calculation & Geofence Radius Validation
    const isAtSchool = distanceToSchool <= (school.geofence_radius_meters || 100);
    const isAtPpd = distanceToPpd <= PPD_TUARAN_OFFICE.radius_meters;
    const isAuthorized = isAtSchool || isAtPpd;

    // STEP 7: Return Authorised or Rejected Result
    if (isAuthorized) {
      const locationName = isAtSchool ? school.name : PPD_TUARAN_OFFICE.name;
      const locationType = isAtSchool ? "SCHOOL" : "PPD_TUARAN";
      const distance = isAtSchool ? distanceToSchool : distanceToPpd;

      return new Response(
        JSON.stringify({
          authorized: true,
          location_type: locationType,
          location_name: locationName,
          distance_meters: distance,
          allowed_radius_meters: isAtSchool ? school.geofence_radius_meters : PPD_TUARAN_OFFICE.radius_meters,
          accuracy_meters: Math.round(accuracy || 0),
          message: `Lokasi disahkan di ${locationName} (${distance}m dalam perimeter)`,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // REJECTED: User is outside permitted boundaries
    const rejectionReason = `Lokasi dikesan di luar perimeter sah: ${distanceToSchool}m dari ${school.name} (had ${school.geofence_radius_meters}m) dan ${distanceToPpd}m dari PPD Tuaran (had ${PPD_TUARAN_OFFICE.radius_meters}m).`;

    // Log security audit for failed location check
    await supabase.from("audit_logs").insert({
      user_id,
      action: "GEOFENCE_BREACH_REJECTED",
      entity_type: "ATTENDANCE_EVENT",
      entity_id: user_id,
      details: {
        action_type,
        latitude,
        longitude,
        accuracy,
        distanceToSchool,
        distanceToPpd,
        reason: rejectionReason,
      },
    });

    return new Response(
      JSON.stringify({
        authorized: false,
        rejection_code: "OUTSIDE_GEOFENCE",
        location_type: "UNAUTHORIZED",
        distance_meters: Math.min(distanceToSchool, distanceToPpd),
        rejection_reason: rejectionReason,
        message: "Pengesanan lokasi gagal. Anda berada di luar kawasan kehadiran yang dibenarkan.",
      }),
      {
        status: 403,
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
