import React, { useState } from 'react';
import { Compass, ShieldCheck, MapPin, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button';
import { PPD_TUARAN_OFFICE } from '@/lib/geofence';

export const GeofenceSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [ppdRadius, setPpdRadius] = useState(150);
  const [defaultSchoolRadius, setDefaultSchoolRadius] = useState(100);
  const [strictMode, setStrictMode] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleSave = () => {
    showToast('Tetapan perimeter geofence berjaya dikemaskini.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" />
            Pengurusan Dasar & Tetapan Geofence
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi radius geofence rasmi bagi ibu pejabat PPD Tuaran dan peraturan pengesahan lokasi sekolah.
          </p>
        </div>

        {isSuperAdmin && (
          <Button variant="primary" size="sm" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
            Simpan Tetapan Geofence
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PPD Tuaran HQ Location Setting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Ibu Pejabat PPD Tuaran (HQ Location)
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Lokasi Sah Semua PGB
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Ibu pejabat PPD Tuaran berfungsi sebagai lokasi alternatif yang sah untuk semua Pengetua dan Guru Besar apabila menghadiri taklimat, bengkel, atau urusan rasmi jabatan.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Alamat Rasmi:</span>
              <span className="text-slate-800 font-sans">{PPD_TUARAN_OFFICE.address}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Latitud:</span>
                <span className="text-slate-800">{PPD_TUARAN_OFFICE.latitude}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Longitud:</span>
                <span className="text-slate-800">{PPD_TUARAN_OFFICE.longitude}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Radius Perimeter PPD Tuaran: <span className="text-blue-600 font-bold">{ppdRadius} Meter</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              disabled={!isSuperAdmin}
              value={ppdRadius}
              onChange={(e) => setPpdRadius(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Global Enforcement Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Penguatkuasaan Geofence Ketat
          </h3>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Mod Ketat (Strict Enforcement)</p>
                <p className="text-[11px] text-slate-500">
                  Sistem menolak percubaan clock-in sekiranya jarak pengguna melebihi radius geofence yang sah.
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
      </div>
    </div>
  );
};
