import React, { useState } from 'react';
import { Compass, ShieldCheck, MapPin, Save, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { dbService } from '@/lib/db';
import { PpdOfficeLocation } from '@/types';
import { InteractiveGeofenceMap } from '@/components/maps/InteractiveGeofenceMap';

export const GeofenceSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [ppdOffice, setPpdOffice] = useState<PpdOfficeLocation>(() =>
    dbService.getPpdOfficeLocation()
  );

  const [lat, setLat] = useState(ppdOffice.latitude);
  const [lng, setLng] = useState(ppdOffice.longitude);
  const [ppdRadius, setPpdRadius] = useState(ppdOffice.radius_meters);
  const [defaultSchoolRadius, setDefaultSchoolRadius] = useState(100);
  const [strictMode, setStrictMode] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleSave = () => {
    if (!user) return;
    try {
      const updated = dbService.updatePpdOfficeLocation(
        {
          latitude: lat,
          longitude: lng,
          radius_meters: ppdRadius,
        },
        user
      );
      setPpdOffice(updated);
      showToast(
        `Tetapan Geofence PPD Tuaran berjaya disimpan (Lat: ${lat.toFixed(6)}, Long: ${lng.toFixed(6)}, Radius: ${ppdRadius}m).`,
        'success'
      );
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-600" />
            Pengurusan Dasar & Tetapan Geofence PPD Tuaran
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi peta interaktif, penentukuran koordinat GPS, dan kawalan perimeter geofence Ibu Pejabat PPD Tuaran (50m - 500m).
          </p>
        </div>

        {isSuperAdmin && (
          <Button variant="teal" size="sm" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
            Simpan Tetapan Geofence PPD
          </Button>
        )}
      </div>

      {/* Main Interactive Map for PPD Tuaran */}
      <div className="space-y-4">
        <InteractiveGeofenceMap
          locationType="PPD"
          latitude={lat}
          longitude={lng}
          radiusMeters={ppdRadius}
          schoolName="Pejabat Pendidikan Daerah Tuaran (Ibu Pejabat)"
          isEditable={isSuperAdmin}
          onRadiusChange={(r) => setPpdRadius(r)}
          onCoordinatesChange={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
        />

        {/* PPD Tuaran Details Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)
              </span>
              <Badge variant="teal" size="sm">PPD-HQ</Badge>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lokasi Kehadiran Sah Berpusat (Semua PGB)
              </span>
            </div>
            <p className="text-xs text-slate-500">{ppdOffice.address}</p>
            <p className="text-[11px] text-slate-400 font-mono">
              Latitud: {lat.toFixed(6)} | Longitud: {lng.toFixed(6)} | Perimeter: {ppdRadius}m
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm"
            >
              <span>Buka di OpenStreetMap</span>
            </a>
          </div>
        </div>
      </div>

      {/* Global Enforcement Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Penguatkuasaan Geofence Ketat (Strict Enforcement)
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Sekat Kehadiran Luar Geofence</p>
                <p className="text-[11px] text-slate-500">
                  Sistem menolak rekod kehadiran sekiranya jarak peranti melebihi perimeter geofence sekolah atau PPD.
                </p>
              </div>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                disabled={!isSuperAdmin}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Radius Piawai Bagi Sekolah Baharu
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="500"
                  disabled={!isSuperAdmin}
                  value={defaultSchoolRadius}
                  onChange={(e) => setDefaultSchoolRadius(parseInt(e.target.value, 10))}
                  className="w-24 px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"
                />
                <span className="text-xs text-slate-500">Meter (50m - 500m)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Maklumat Tambahan Lokasi PPD
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ibu Pejabat PPD Tuaran adalah zon khas berpusat. Mana-mana Pengetua atau Guru Besar (PGB) yang hadir ke PPD Tuaran bagi mesyuarat rasmi, taklimat, atau penyerahan dokumen dibenarkan membuat clock-in dalam perimeter geofence ini tanpa memerlukan justifikasi manual luar kawasan.
          </p>
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800">
            <strong>Nota Pentadbir:</strong> Sebarang perubahan koordinat atau radius PPD Tuaran akan berkuat kuasa serta-merta untuk semakan kehadiran semua sekolah di bawah daerah Tuaran.
          </div>
        </div>
      </div>
    </div>
  );
};
