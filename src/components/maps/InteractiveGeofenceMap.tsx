import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Building2,
  School,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Navigation,
  Eye,
  Sliders,
} from 'lucide-react';
import { PPD_TUARAN_OFFICE, calculateHaversineDistanceMeters } from '@/lib/geofence';

interface InteractiveGeofenceMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  schoolName: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
  isEditable?: boolean;
}

export const InteractiveGeofenceMap: React.FC<InteractiveGeofenceMapProps> = ({
  latitude,
  longitude,
  radiusMeters,
  schoolName,
  onCoordinatesChange,
  onRadiusChange,
  isEditable = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  const [mapType, setMapType] = useState<'STREET' | 'SATELLITE'>('STREET');
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Calculate distance from school to PPD Tuaran office
  const distToPpd = calculateHaversineDistanceMeters(
    latitude,
    longitude,
    PPD_TUARAN_OFFICE.latitude,
    PPD_TUARAN_OFFICE.longitude
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet Map centered on the exact school coordinates
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 16,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Tile Layer
    const streetTiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }
    );

    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles © Esri',
      }
    );

    if (mapType === 'STREET') {
      streetTiles.addTo(map);
    } else {
      satelliteTiles.addTo(map);
    }

    // Custom School Icon
    const schoolIcon = L.divIcon({
      className: 'custom-school-marker',
      html: `
        <div style="background-color: #1E40AF; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 5v17"/><path d="M6 5v17"/></svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    // Custom PPD Tuaran Icon
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

    // Add School Marker (Draggable if editable)
    const schoolMarker = L.marker([latitude, longitude], {
      icon: schoolIcon,
      draggable: isEditable,
    }).addTo(map);
    schoolMarkerRef.current = schoolMarker;

    schoolMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #0f172a; font-size: 13px;">${schoolName}</strong><br/>
        <span style="color: #64748b;">Pusat Rasmi Kehadiran Sekolah</span><br/>
        <span style="font-family: monospace; color: #2563eb; font-weight: bold;">
          ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
        </span><br/>
        <span style="color: #0d9488; font-weight: 600;">Radius Sah: ${radiusMeters} Meter</span>
      </div>
    `);

    // Add Geofence Circle
    const geofenceCircle = L.circle([latitude, longitude], {
      color: '#2563EB',
      fillColor: '#3B82F6',
      fillOpacity: 0.22,
      weight: 2.5,
      radius: radiusMeters,
    }).addTo(map);
    geofenceCircleRef.current = geofenceCircle;

    // Add PPD Tuaran HQ Marker and Approved 150m Circle
    const ppdMarker = L.marker([PPD_TUARAN_OFFICE.latitude, PPD_TUARAN_OFFICE.longitude], {
      icon: ppdIcon,
    }).addTo(map);

    ppdMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #0f172a; font-size: 13px;">${PPD_TUARAN_OFFICE.name}</strong><br/>
        <span style="color: #64748b;">Lokasi Sah Kedua untuk Semua PGB</span><br/>
        <span style="color: #0d9488; font-weight: 600;">Radius Sah: ${PPD_TUARAN_OFFICE.radius_meters} Meter</span>
      </div>
    `);

    L.circle([PPD_TUARAN_OFFICE.latitude, PPD_TUARAN_OFFICE.longitude], {
      color: '#0D9488',
      fillColor: '#14B8A6',
      fillOpacity: 0.18,
      weight: 2,
      radius: PPD_TUARAN_OFFICE.radius_meters,
    }).addTo(map);

    // Event: Marker dragged
    if (isEditable && onCoordinatesChange) {
      schoolMarker.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        onCoordinatesChange(position.lat, position.lng);
      });

      // Event: Map clicked to reposition pin
      map.on('click', (e) => {
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapType]); // Re-initialize if mapType changes

  // Update marker & circle when latitude, longitude or radius changes
  useEffect(() => {
    if (mapInstanceRef.current && schoolMarkerRef.current && geofenceCircleRef.current) {
      const newPos = new L.LatLng(latitude, longitude);
      schoolMarkerRef.current.setLatLng(newPos);
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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 text-white relative shadow-xl flex flex-col">
      {/* Top Header / Status Bar */}
      <div className="p-4 bg-navy-950/95 border-b border-navy-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">{schoolName}</h4>
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

        {/* Action Controls & External Map Links */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map Layer Toggle */}
          <div className="flex rounded-lg border border-slate-700 bg-navy-900 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMapType('STREET')}
              className={`px-2.5 py-1 rounded transition-all ${
                mapType === 'STREET'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Peta Jalan
            </button>
            <button
              onClick={() => setMapType('SATELLITE')}
              className={`px-2.5 py-1 rounded transition-all ${
                mapType === 'SATELLITE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Peta Satelit
            </button>
          </div>

          {/* Open in Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Buka di Google Maps</span>
            <ExternalLink className="w-3 h-3 text-emerald-200" />
          </a>

          {/* Street View */}
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-slate-700 transition-all"
            title="Lihat Pemandangan Jalan Raya (Google Street View)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Street View</span>
          </a>
        </div>
      </div>

      {/* Real Map Container */}
      <div className="relative h-[420px] w-full z-10 bg-slate-950">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Floating Legend / Quick Info Box */}
        <div className="absolute top-3 left-3 z-[1000] bg-navy-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 shadow-xl max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
            <span className="font-bold text-white">Sekolah: {schoolName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <span className="w-3 h-3 rounded-full bg-teal-500 border border-white" />
            <span>PPD Tuaran: {(distToPpd / 1000).toFixed(2)} km dari sini</span>
          </div>
          <div className="text-[11px] text-blue-300 font-semibold pt-1 border-t border-slate-800 flex items-center justify-between">
            <span>Radius Geofence:</span>
            <span className="font-mono text-emerald-400 font-bold">{radiusMeters} Meter</span>
          </div>
          {isEditable && (
            <p className="text-[10px] text-slate-400 italic pt-1">
              *Klik peta atau seret penanda untuk menukar koordinat sekolah.
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
                Radius Perimeter Kehadiran (Geofence):
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
              <span>Piawai: 100m</span>
              <span>Maks: 500m</span>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-xs text-slate-300 font-semibold mb-1">
              Pindaan Koordinat Tepat (GPS Input):
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
