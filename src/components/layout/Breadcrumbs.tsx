import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const PATH_MAP: Record<string, string> = {
  '/admin/dashboard': 'Dashboard Pentadbiran',
  '/admin/zones': 'Pengurusan Zon',
  '/admin/schools': 'Pengurusan Sekolah',
  '/admin/users': 'Pengurusan Pengguna (PGB)',
  '/admin/admins': 'Pengurusan Pentadbir Zon & Sistem',
  '/admin/locations/map': 'Peta Lokasi Sekolah',
  '/admin/locations/geofence': 'Pengurusan Geofence',
  '/admin/attendance/monitoring': 'Pemantauan Kehadiran Harian',
  '/admin/attendance/justifications': 'Semakan Justifikasi Kehadiran',
  '/admin/monthly-verification': 'Semakan & Pengesahan Bulanan',
  '/admin/approver-assignments': 'Penetapan Pegawai Pengesah Bulanan',
  '/admin/system/calendar': 'Kalendar & Cuti Persekolahan',
  '/admin/system/rules': 'Peraturan & Masa Kehadiran',
  '/admin/notifications': 'Pusat Notifikasi Sistem',
  '/admin/reports': 'Laporan & Analitik Kehadiran',
  '/admin/audit-logs': 'Log Audit Pentadbiran',
  '/admin/settings': 'Tetapan Sistem Pentadbiran',
  '/admin/profile': 'Profil Pegawai Pentadbir',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPath, onNavigate }) => {
  const currentTitle = PATH_MAP[currentPath] || 'Halaman';

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
      <button
        onClick={() => onNavigate('/admin/dashboard')}
        className="flex items-center gap-1 hover:text-blue-700 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Portal Admin</span>
      </button>
      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="font-semibold text-slate-900">{currentTitle}</span>
    </nav>
  );
};

