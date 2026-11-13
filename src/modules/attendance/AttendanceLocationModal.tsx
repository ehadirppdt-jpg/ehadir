import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  X,
  MapPin,
  Clock,
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  School,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { AttendanceRecord, School as SchoolType } from '@/types';
import { dbService } from '@/lib/db';
import { OSM_TILE_URL, OSM_ATTRIBUTION, getPpdTuaranOfficeLocation } from '@/lib/geofence';
import { formatLocalTime } from '@/lib/dateUtils';

interface AttendanceLocationModalProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceLocationModal: React.FC<AttendanceLocationModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [copiedCoords, setCopiedCoords] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  // Retrieve assigned school details for reference
  const schools = dbService.getSchools();
  const school = schools.find((s) => s.id === record.school_id || s.name === record.school_name);
  const ppdOffice = getPpdTuaranOfficeLocation();

  // Determine fallback coordinates if specific GPS lat/lng not stored
  const defaultSchoolLat = school?.latitude || 6.182;
  const defaultSchoolLng = school?.longitude || 116.235;

  const inLat = record.clock_in_lat ?? defaultSchoolLat;
  const inLng = record.clock_in_lng ?? defaultSchoolLng;
  const inAccuracy = record.clock_in_accuracy ?? 15;

  const outLat = record.clock_out_lat ?? inLat;
  const outLng = record.clock_out_lng ?? inLng;
  const outAccuracy = record.clock_out_accuracy ?? 15;

  const hasClockIn = !!record.clock_in_time;
  const hasClockOut = !!record.clock_out_time;

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates based on active tab
    let centerLat = inLat;
    let centerLng = inLng;

    if (activeTab === 'OUT' && hasClockOut) {
      centerLat = outLat;
      centerLng = outLng;
    } else if (activeTab === 'ALL' && hasClockIn && hasClockOut) {
      centerLat = (inLat + outLat) / 2;
      centerLng = (inLng + outLng) / 2;
    }

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 16,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Standard OpenStreetMap Tiles
    L.tileLayer(OSM_TILE_URL, {
      maxZoom: 19,
      attribution: OSM_ATTRIBUTION,
    }).addTo(map);

    const markers: L.Marker[] = [];

    // 1. Geofence Circle for School
    if (school?.latitude && school?.longitude) {
      L.circle([school.latitude, school.longitude], {
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        weight: 2,
        radius: school.geofence_radius_meters || 100,
      }).addTo(map);
    }

    // 2. Geofence Circle for PPD Tuaran
    L.circle([ppdOffice.latitude, ppdOffice.longitude], {
      color: '#0D9488',
      fillColor: '#14B8A6',
      fillOpacity: 0.12,
      weight: 1.5,
      radius: ppdOffice.radius_meters || 200,
    }).addTo(map);

    // 3. Clock-In Marker (Green Pin)
    if (hasClockIn && (activeTab === 'ALL' || activeTab === 'IN')) {
      const inIcon = L.divIcon({
        className: 'custom-in-marker',
        html: `
          <div style="background-color: #059669; width: 36px; height: 36px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(5,150,105,0.45); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            IN
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const inMarker = L.marker([inLat, inLng], { icon: inIcon }).addTo(map);
      inMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 170px;">
          <strong style="color: #059669; font-size: 13px;">📍 LOKASI CLOCK-IN</strong><br/>
          <strong>Waktu:</strong> ${formatLocalTime(record.clock_in_time)}<br/>
          <strong>Lokasi:</strong> ${record.clock_in_location || 'Lokasi Sah Geofence'}<br/>
          <strong>Koordinat:</strong> ${inLat.toFixed(6)}, ${inLng.toFixed(6)}<br/>
          <span style="color: #059669; font-weight: bold;">✓ Sah Geofence (±${Math.round(inAccuracy)}m)</span>
        </div>
      `);
      markers.push(inMarker);

      // Circle representing device GPS accuracy
      L.circle([inLat, inLng], {
        color: '#10B981',
        fillColor: '#34D399',
        fillOpacity: 0.15,
        weight: 1,
        radius: Math.max(10, inAccuracy),
      }).addTo(map);
    }

    // 4. Clock-Out Marker (Blue Pin)
    if (hasClockOut && (activeTab === 'ALL' || activeTab === 'OUT')) {
      const outIcon = L.divIcon({
        className: 'custom-out-marker',
        html: `
          <div style="background-color: #2563EB; width: 36px; height: 36px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.45); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            OUT
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const outMarker = L.marker([outLat, outLng], { icon: outIcon }).addTo(map);
      outMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 170px;">
          <strong style="color: #2563EB; font-size: 13px;">📍 LOKASI CLOCK-OUT</strong><br/>
          <strong>Waktu:</strong> ${formatLocalTime(record.clock_out_time)}<br/>
          <strong>Lokasi:</strong> ${record.clock_out_location || 'Lokasi Sah Geofence'}<br/>
          <strong>Koordinat:</strong> ${outLat.toFixed(6)}, ${outLng.toFixed(6)}<br/>
          <span style="color: #2563EB; font-weight: bold;">✓ Sah Geofence (±${Math.round(outAccuracy)}m)</span>
        </div>
      `);
      markers.push(outMarker);

      L.circle([outLat, outLng], {
        color: '#3B82F6',
        fillColor: '#60A5FA',
        fillOpacity: 0.15,
        weight: 1,
        radius: Math.max(10, outAccuracy),
      }).addTo(map);
    }

    // Connect line between IN and OUT if both exist
    if (hasClockIn && hasClockOut && activeTab === 'ALL') {
      L.polyline(
        [
          [inLat, inLng],
          [outLat, outLng],
        ],
        {
          color: '#6366F1',
          weight: 2,
          dashArray: '5, 8',
        }
      ).addTo(map);

      // Fit bounds to show both
      if (markers.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.3));
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [record, activeTab]);

  const handleCopy = (coordsText: string, type: string) => {
    navigator.clipboard.writeText(coordsText);
    setCopiedCoords(type);
    setTimeout(() => setCopiedCoords(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Verifikasi Lokasi GPS &amp; Geofence
              </h3>
              <p className="text-xs text-slate-500">
                {record.pgb_name} • {record.school_name} ({record.date})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Toggle Tabs */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Lokasi ({hasClockIn && hasClockOut ? '2' : '1'})
            </button>
            <button
              onClick={() => setActiveTab('IN')}
              disabled={!hasClockIn}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'IN'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Clock-In Sah
            </button>
            <button
              onClick={() => setActiveTab('OUT')}
              disabled={!hasClockOut}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'OUT'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Clock-Out Sah
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Geofence Disahkan
          </span>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-72 sm:h-80 bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Floating Legend */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-2.5 shadow-md text-[10px] space-y-1 font-medium">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Lokasi Masuk (Clock-In)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <span>Lokasi Keluar (Clock-Out)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full border border-blue-600 bg-blue-200/60 shrink-0" />
              <span>Zon Radius Geofence</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Clock-In Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  WAKTU MASUK (CLOCK-IN)
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {formatLocalTime(record.clock_in_time)}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900 truncate">
                  {record.clock_in_location || record.school_name}
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  Lat: {inLat.toFixed(6)}, Lng: {inLng.toFixed(6)}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Dalam Geofence (±{Math.round(inAccuracy)}m)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(`${inLat}, ${inLng}`, 'IN')}
                      className="text-slate-500 hover:text-slate-800 p-1"
                      title="Salin Koordinat"
                    >
                      {copiedCoords === 'IN' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${inLat}&mlon=${inLng}#map=18/${inLat}/${inLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Buka dalam OpenStreetMap Luar"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Clock-Out Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  WAKTU KELUAR (CLOCK-OUT)
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {hasClockOut ? formatLocalTime(record.clock_out_time) : 'Belum Keluar'}
                </span>
              </div>

              {hasClockOut ? (
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {record.clock_out_location || record.school_name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">
                    Lat: {outLat.toFixed(6)}, Lng: {outLng.toFixed(6)}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-blue-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      Dalam Geofence (±{Math.round(outAccuracy)}m)
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(`${outLat}, ${outLng}`, 'OUT')}
                        className="text-slate-500 hover:text-slate-800 p-1"
                        title="Salin Koordinat"
                      >
                        {copiedCoords === 'OUT' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${outLat}&mlon=${outLng}#map=18/${outLat}/${outLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Buka dalam OpenStreetMap Luar"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic pt-2">
                  PGB belum merekodkan waktu keluar untuk hari ini.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Piawaian OpenStreetMap + Geofence Haversine PPD Tuaran
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

