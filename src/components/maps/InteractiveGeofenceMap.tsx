// e-HADIR TUARAN — INTERACTIVE OPENSTREETMAP GEOFENCE COMPONENT
// NO GOOGLE MAPS API: Uses Leaflet.js + OpenStreetMap (OSM) Standard Raster Tiles + Browser Geolocation API

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Building2,
  School,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  Sliders,
  LocateFixed,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import {
  getPpdTuaranOfficeLocation,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  calculateHaversineDistanceMeters,
  getDeviceCurrentPosition,
  DeviceGpsPayload,
} from '@/lib/geofence';

interface InteractiveGeofenceMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  schoolName: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
  isEditable?: boolean;
  locationType?: 'SCHOOL' | 'PPD';
}

export const InteractiveGeofenceMap: React.FC<InteractiveGeofenceMapProps> = ({
  latitude,
  longitude,
  radiusMeters,
  schoolName,
  onCoordinatesChange,
  onRadiusChange,
  isEditable = true,
  locationType = 'SCHOOL',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const primaryMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const userGpsCircleRef = useRef<L.Circle | null>(null);

  const [copiedCoords, setCopiedCoords] = useState(false);
  const [deviceGps, setDeviceGps] = useState<DeviceGpsPayload | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  const isPpdMode = locationType === 'PPD';

  // Get live PPD Tuaran office coordinates (from localStorage or defaults)
  const currentPpdOffice = getPpdTuaranOfficeLocation();

  // Calculate distance from current target to PPD Tuaran office (if in school mode)
  const distToPpd = !isPpdMode
    ? calculateHaversineDistanceMeters(
        latitude,
        longitude,
        currentPpdOffice.latitude,
        currentPpdOffice.longitude
      )
    : 0;

  // Calculate user device distance to current target if GPS is active
  const distUserToTarget = deviceGps
    ? calculateHaversineDistanceMeters(deviceGps.latitude, deviceGps.longitude, latitude, longitude)
    : null;

  // Initialize Leaflet OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet Map centered on coordinates
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 16,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Standard OpenStreetMap Raster Tiles with Strict Attribution
    L.tileLayer(OSM_TILE_URL, {
      maxZoom: 19,
      attribution: OSM_ATTRIBUTION,
    }).addTo(map);

    // Custom Primary Marker Icon: Blue for School, Teal for PPD
    const primaryColor = isPpdMode ? '#0D9488' : '#1E40AF';
    const primarySvg = isPpdMode
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 5v17"/><path d="M6 5v17"/></svg>`;

    const primaryIcon = L.divIcon({
      className: 'custom-primary-marker',
      html: `
        <div style="background-color: ${primaryColor}; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; color: white;">
          ${primarySvg}
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    // Add Primary Target Marker (Draggable if admin has edit permission)
    const primaryMarker = L.marker([latitude, longitude], {
      icon: primaryIcon,
      draggable: isEditable,
    }).addTo(map);
    primaryMarkerRef.current = primaryMarker;

    const popupSubtext = isPpdMode
      ? 'Ibu Pejabat PPD Tuaran (Lokasi Sah Berpusat)'
      : 'Pusat Rasmi Kehadiran Sekolah (OSM)';

    primaryMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #0f172a; font-size: 13px;">${schoolName}</strong><br/>
        <span style="color: #64748b;">${popupSubtext}</span><br/>
        <span style="font-family: monospace; color: ${primaryColor}; font-weight: bold;">
          ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
        </span><br/>
        <span style="color: #0d9488; font-weight: 600;">Radius Geofence: ${radiusMeters} Meter</span>
      </div>
    `);

    // Add Geofence Circle (Blue for School, Teal for PPD)
    const circleStrokeColor = isPpdMode ? '#0D9488' : '#2563EB';
    const circleFillColor = isPpdMode ? '#14B8A6' : '#3B82F6';

    const geofenceCircle = L.circle([latitude, longitude], {
      color: circleStrokeColor,
      fillColor: circleFillColor,
      fillOpacity: 0.22,
      weight: 2.5,
      radius: radiusMeters,
    }).addTo(map);
    geofenceCircleRef.current = geofenceCircle;

    // In SCHOOL mode, also display secondary PPD Tuaran marker
    if (!isPpdMode) {
      const ppdIcon = L.divIcon({
        className: 'custom-ppd-marker',
        html: `
          <div style="background-color: #0D9488; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const ppdMarker = L.marker([currentPpdOffice.latitude, currentPpdOffice.longitude], {
        icon: ppdIcon,
      }).addTo(map);

      ppdMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0f172a; font-size: 13px;">${currentPpdOffice.name}</strong><br/>
          <span style="color: #64748b;">Lokasi Sah Kedua untuk Semua PGB</span><br/>
          <span style="color: #0d9488; font-weight: 600;">Radius Geofence: ${currentPpdOffice.radius_meters} Meter</span>
        </div>
      `);

      L.circle([currentPpdOffice.latitude, currentPpdOffice.longitude], {
        color: '#0D9488',
        fillColor: '#14B8A6',
        fillOpacity: 0.18,
        weight: 2,
        radius: currentPpdOffice.radius_meters,
      }).addTo(map);
    }

    // Event 1: Marker dragged by user
    if (isEditable && onCoordinatesChange) {
      primaryMarker.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        onCoordinatesChange(position.lat, position.lng);
      });

      // Event 2: Click anywhere on map to reposition marker
      map.on('click', (e) => {
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [locationType]);

  // Update marker & circle when latitude, longitude or radius changes
  useEffect(() => {
    if (mapInstanceRef.current && primaryMarkerRef.current && geofenceCircleRef.current) {
      const newPos = new L.LatLng(latitude, longitude);
      primaryMarkerRef.current.setLatLng(newPos);
      geofenceCircleRef.current.setLatLng(newPos);
      geofenceCircleRef.current.setRadius(radiusMeters);
      mapInstanceRef.current.panTo(newPos, { animate: true });
    }
  }, [latitude, longitude, radiusMeters]);

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  // Test live device GPS via Browser Geolocation API
  const handleTestDeviceGps = async () => {
    setIsLocating(true);
    setLocatingError(null);

    try {
      const gps = await getDeviceCurrentPosition();
      setDeviceGps(gps);

      if (mapInstanceRef.current) {
        const userLatLng = new L.LatLng(gps.latitude, gps.longitude);

        // Remove old user markers if exist
        if (userGpsMarkerRef.current) mapInstanceRef.current.removeLayer(userGpsMarkerRef.current);
        if (userGpsCircleRef.current) mapInstanceRef.current.removeLayer(userGpsCircleRef.current);

        // Create live user location marker (Emerald Pulse)
        const userIcon = L.divIcon({
          className: 'custom-user-gps-marker',
          html: `
            <div style="background-color: #059669; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; color: white;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(mapInstanceRef.current);
        userMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #059669; font-size: 13px;">Lokasi GPS Peranti Anda</strong><br/>
            <span style="font-family: monospace; color: #0f172a;">
              ${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}
            </span><br/>
            <span style="color: #64748b;">Ketepatan: ±${Math.round(gps.accuracy)}m</span>
          </div>
        `).openPopup();
        userGpsMarkerRef.current = userMarker;

        // Accuracy circle
        const accuracyCircle = L.circle(userLatLng, {
          color: '#059669',
          fillColor: '#10B981',
          fillOpacity: 0.15,
          weight: 1.5,
          radius: Math.max(gps.accuracy, 20),
        }).addTo(mapInstanceRef.current);
        userGpsCircleRef.current = accuracyCircle;

        // Fit bounds to show both target and user
        const bounds = L.latLngBounds([userLatLng, new L.LatLng(latitude, longitude)]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      }
    } catch (err: any) {
      setLocatingError(err.message || 'Gagal mengesan koordinat GPS peranti.');
    } finally {
      setIsLocating(false);
    }
  };

  // OpenStreetMap link (No Google Maps API)
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 text-white relative shadow-xl flex flex-col">
      {/* Top Header / Status Bar */}
      <div className="p-4 bg-navy-950/95 border-b border-navy-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isPpdMode
                ? 'bg-teal-600/30 border-teal-500/40 text-teal-400'
                : 'bg-blue-600/30 border-blue-500/40 text-blue-400'
            }`}
          >
            {isPpdMode ? <Building2 className="w-5 h-5" /> : <School className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">{schoolName}</h4>
              {isPpdMode && (
                <span className="text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Ibu Pejabat PPD
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-blue-400 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800">
                {latitude.toFixed(6)}° N, {longitude.toFixed(6)}° E
              </span>
              <button
                onClick={handleCopyCoordinates}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Salin Koordinat GPS"
              >
                {copiedCoords ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCoords ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls & OpenStreetMap Links */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Device GPS Test Button (Browser Geolocation API) */}
          <button
            onClick={handleTestDeviceGps}
            disabled={isLocating}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
              isLocating
                ? 'bg-emerald-800 text-emerald-200 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Uji koordinat GPS peranti sebenar melalui Browser Geolocation API"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Mengesan GPS...' : 'Uji GPS Peranti'}</span>
          </button>

          {/* Open in OpenStreetMap (NO Google Maps) */}
          <a
            href={openStreetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Buka di OpenStreetMap</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* GPS Error Alert if any */}
      {locatingError && (
        <div className="px-4 py-2.5 bg-rose-950/80 border-b border-rose-800 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{locatingError}</span>
        </div>
      )}

      {/* Real OpenStreetMap Container */}
      <div className="relative h-[420px] w-full z-10 bg-slate-950">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Floating Legend / Quick Info Box */}
        <div className="absolute top-3 left-3 z-[1000] bg-navy-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 shadow-xl max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full border border-white ${
                isPpdMode ? 'bg-teal-500' : 'bg-blue-600'
              }`}
            />
            <span className="font-bold text-white">
              {isPpdMode ? 'Ibu Pejabat PPD Tuaran' : `Sekolah: ${schoolName}`}
            </span>
          </div>

          {!isPpdMode && (
            <div className="flex items-center gap-2 text-slate-300 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-teal-500 border border-white" />
              <span>PPD Tuaran: {(distToPpd / 1000).toFixed(2)} km dari sini</span>
            </div>
          )}

          {isPpdMode && (
            <div className="text-[11px] text-teal-300">
              Lokasi berpusat sah untuk kehadiran semua Pengetua & Guru Besar semasa urusan rasmi.
            </div>
          )}

          <div className="text-[11px] text-blue-300 font-semibold pt-1 border-t border-slate-800 flex items-center justify-between">
            <span>Radius Sah Geofence:</span>
            <span className="font-mono text-emerald-400 font-bold">{radiusMeters} Meter</span>
          </div>

          {/* If user GPS tested, show real-time Haversine distance */}
          {deviceGps && distUserToTarget !== null && (
            <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] text-emerald-300 space-y-0.5">
              <div className="flex items-center justify-between">
                <span>Jarak Anda ke Lokasi:</span>
                <span className="font-mono font-bold">{distUserToTarget}m</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Geofence:</span>
                <span
                  className={`font-bold ${
                    distUserToTarget <= radiusMeters ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {distUserToTarget <= radiusMeters ? 'DALAM RADIUS (SAH)' : 'LUAR RADIUS'}
                </span>
              </div>
            </div>
          )}

          {isEditable && (
            <p className="text-[10px] text-slate-400 italic pt-1">
              *Klik peta atau seret penanda untuk menukar koordinat {isPpdMode ? 'PPD Tuaran' : 'sekolah'}.
            </p>
          )}
        </div>
      </div>

      {/* Geofence Configuration Bar */}
      {isEditable && onRadiusChange && onCoordinatesChange && (
        <div className="p-4 bg-navy-950 border-t border-navy-800 grid grid-cols-1 md:grid-cols-2 gap-4 z-20">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Radius Perimeter Kehadiran ({isPpdMode ? 'PPD Tuaran' : 'Sekolah'}):
              </span>
              <span className="text-blue-400 font-mono font-bold text-sm">{radiusMeters} Meter</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={radiusMeters}
              onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Min: 50m</span>
              <span>Piawai: {isPpdMode ? '150m' : '100m'}</span>
              <span>Maks: 500m</span>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-xs text-slate-300 font-semibold mb-1">
              Pindaan Koordinat Tepat (GPS Input {isPpdMode ? 'PPD' : 'Sekolah'}):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Latitud</label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onCoordinatesChange(val, longitude);
                  }}
                  className="w-full px-2 py-1 bg-navy-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Longitud</label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onCoordinatesChange(latitude, val);
                  }}
                  className="w-full px-2 py-1 bg-navy-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
