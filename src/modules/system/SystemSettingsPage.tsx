import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  Bell,
  Sliders,
  Database,
  Lock,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button';

export const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [systemName, setSystemName] = useState('e-HADIR TUARAN');
  const [district, setDistrict] = useState('Pejabat Pendidikan Daerah Tuaran');
  const [defaultRadius, setDefaultRadius] = useState(100);
  const [minRadius, setMinRadius] = useState(50);
  const [maxRadius, setMaxRadius] = useState(500);
  const [notifyApproversOnSubmission, setNotifyApproversOnSubmission] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [mockGpsDetection, setMockGpsDetection] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Tetapan global sistem berjaya dikemaskini dan disimpan.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Tetapan Global Sistem (System Settings)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi pusat pentadbiran e-HADIR TUARAN. Hanya Super Admin (Ketua Pentadbir) mempunyai kebenaran meminda parameter ini.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveSettings}
            icon={<Save className="w-4 h-4" />}
          >
            Simpan Tetapan Global
          </Button>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Maklumat Asas PPD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Building2Icon className="w-4 h-4 text-blue-600" />
            Identiti Jabatan & Sistem
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sistem</label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pejabat Pendidikan Daerah</label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* 2. Parameter Geofence Piawai */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" />
            Had Piawai Geofence Sekolah
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Radius Min</label>
              <input
                type="number"
                disabled={!isSuperAdmin}
                value={minRadius}
                onChange={(e) => setMinRadius(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Radius Piawai</label>
              <input
                type="number"
                disabled={!isSuperAdmin}
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Radius Maks</label>
              <input
                type="number"
                disabled={!isSuperAdmin}
                value={maxRadius}
                onChange={(e) => setMaxRadius(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Kesan Penggunaan Lokasi Palsu (Mock GPS)</p>
                <p className="text-[11px] text-slate-400">Sekat clock-in jika peranti menggunakan aplikasi pengubah lokasi</p>
              </div>
              <input
                type="checkbox"
                checked={mockGpsDetection}
                onChange={(e) => setMockGpsDetection(e.target.checked)}
                disabled={!isSuperAdmin}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Notifikasi Automatik kepada Admin Zon</p>
                <p className="text-[11px] text-slate-400">Hantar amaran segera apabila PGB menghantar laporan bulanan</p>
              </div>
              <input
                type="checkbox"
                checked={notifyApproversOnSubmission}
                onChange={(e) => setNotifyApproversOnSubmission(e.target.checked)}
                disabled={!isSuperAdmin}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const Building2Icon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/>
    <path d="M10 6h4"/>
    <path d="M10 10h4"/>
    <path d="M10 14h4"/>
    <path d="M10 18h4"/>
  </svg>
);

