import React, { useState } from 'react';
import { MapPin, Compass, Navigation, School, Building2, Check, AlertCircle } from 'lucide-react';
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
  const [zoom, setZoom] = useState(16);
  const [userSimLat, setUserSimLat] = useState(latitude + 0.0003);
  const [userSimLng, setUserSimLng] = useState(longitude + 0.0003);

  // Distance from simulated point to school center
  const distToSchool = calculateHaversineDistanceMeters(
    userSimLat,
    userSimLng,
    latitude,
    longitude
  );

  const isInside = distToSchool <= radiusMeters;

  const distToPpd = calculateHaversineDistanceMeters(
    latitude,
    longitude,
    PPD_TUARAN_OFFICE.latitude,
    PPD_TUARAN_OFFICE.longitude
  );

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 text-white relative shadow-xl">
      {/* Map Header / Status Bar */}
      <div className="p-4 bg-navy-950/90 border-b border-navy-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">{schoolName}</h4>
            <p className="text-[10px] font-mono text-slate-400">
              GPS: {latitude.toFixed(6)}° N, {longitude.toFixed(6)}° E
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
            Radius: {radiusMeters} Meter
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-semibold flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Jarak ke PPD Tuaran: {(distToPpd / 1000).toFixed(2)} km
          </span>
        </div>
      </div>

      {/* Visual Canvas Map Area */}
      <div className="relative h-96 w-full bg-[#0d1b2a] flex items-center justify-center overflow-hidden select-none">
        {/* Geographic Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, #38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Road & Terrain Simulation Vectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <path
            d="M 0,220 Q 250,210 500,280 T 1000,180"
            fill="none"
            stroke="#475569"
            strokeWidth="14"
          />
          <path
            d="M 0,220 Q 250,210 500,280 T 1000,180"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="8 8"
          />
          <path
            d="M 380,0 Q 420,180 500,280 T 560,500"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
          />
        </svg>

        {/* Geofence Perimeter Circle (Visualized scale) */}
        <div
          className="absolute rounded-full border-2 border-blue-400/80 bg-blue-500/15 flex items-center justify-center animate-pulse"
          style={{
            width: `${Math.min(340, Math.max(120, (radiusMeters / 500) * 320))}px`,
            height: `${Math.min(340, Math.max(120, (radiusMeters / 500) * 320))}px`,
          }}
        >
          <div className="absolute top-2 text-[10px] font-bold text-blue-300 bg-navy-950/80 px-2 py-0.5 rounded border border-blue-400/40">
            Zon Sah Kehadiran ({radiusMeters}m)
          </div>
        </div>

        {/* School Center Marker */}
        <div className="absolute z-20 flex flex-col items-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-blue-400/50">
            <School className="w-5 h-5" />
          </div>
          <span className="mt-1 text-[11px] font-extrabold bg-navy-950/90 text-white px-2 py-0.5 rounded shadow border border-slate-700">
            {schoolName}
          </span>
        </div>

        {/* Simulated PGB Clock-in Tester Pin */}
        <div
          className="absolute z-30 flex flex-col items-center transition-all duration-300"
          style={{ transform: 'translate(45px, -35px)' }}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ${
              isInside
                ? 'bg-emerald-500 text-white ring-emerald-300'
                : 'bg-rose-500 text-white ring-rose-300'
            }`}
          >
            <Navigation className="w-4 h-4" />
          </div>
          <span
            className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded shadow ${
              isInside ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
            }`}
          >
            {isInside ? 'Dalam Radius' : 'Luar Radius'} ({distToSchool}m)
          </span>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-3 right-3 bg-navy-950/90 border border-slate-700 rounded-lg p-1.5 flex flex-col gap-1 z-30">
          <button
            onClick={() => setZoom((z) => Math.min(18, z + 1))}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 text-sm font-bold"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(14, z - 1))}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 text-sm font-bold"
          >
            -
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-navy-950/90 border border-slate-700 rounded-lg px-3 py-2 text-[11px] text-slate-300 flex items-center gap-3 z-30">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Pusat Sekolah</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Titik Hadir Sah</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>PPD Tuaran (150m)</span>
          </div>
        </div>
      </div>

      {/* Geofence Configuration Slider & Location Coordinates Controls */}
      {isEditable && onRadiusChange && onCoordinatesChange && (
        <div className="p-4 bg-navy-950 border-t border-navy-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300">Konfigurasi Radius Pagar Geofence (Meter):</span>
              <span className="text-blue-400 font-bold">{radiusMeters} Meter</span>
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
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Min: 50m</span>
              <span>Piawai: 100m</span>
              <span>Maks: 500m</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300">Pindaan Koordinat Pantas (Offset):</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onCoordinatesChange(latitude + 0.0001, longitude)}
                className="px-2 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-700 font-medium"
              >
                Gerak ke Utara (+0.0001)
              </button>
              <button
                type="button"
                onClick={() => onCoordinatesChange(latitude - 0.0001, longitude)}
                className="px-2 py-1 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded border border-navy-700 font-medium"
              >
                Gerak ke Selatan (-0.0001)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
