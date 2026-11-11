import React, { useState, useMemo } from 'react';
import {
  School,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileQuestion,
  FileCheck2,
  CalendarCheck,
  Filter,
  MapPin,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { StatCard } from './StatCard';
import { AttendanceCharts } from './AttendanceCharts';
import { Button } from '@/components/common/Button';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');

  const zones = useMemo(() => dbService.getZones(), []);
  const allSchools = useMemo(() => dbService.getSchools(), []);

  // Filter zones according to Admin Zon permissions if applicable
  const accessibleZones = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'MONITORING_ADMIN') {
      return zones;
    }
    if (user?.role === 'ADMIN_ZON') {
      return zones.filter((z) => (user.assigned_zone_ids || []).includes(z.id));
    }
    return [];
  }, [user, zones]);

  // If Admin Zon has a limited scope, adjust default selected zone
  const activeZoneId = useMemo(() => {
    if (selectedZone !== 'ALL') return selectedZone;
    if (user?.role === 'ADMIN_ZON' && accessibleZones.length > 0) {
      // If user has not selected ALL or cannot see all, default to first assigned
      return undefined; // Service handles all assigned when undefined
    }
    return undefined;
  }, [selectedZone, user, accessibleZones]);

  // Calculate live database metrics
  const stats = useMemo(() => {
    return dbService.getDashboardStats(activeZoneId);
  }, [activeZoneId]);

  return (
    <div className="space-y-6">
      {/* Welcome & Role Scoping Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-blue-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            {user?.role === 'SUPER_ADMIN'
              ? 'Ketua Pentadbir (Super Admin) • Semua 6 Zon'
              : user?.role === 'ADMIN_ZON'
              ? 'Pentadbir Zon Ditugaskan'
              : 'Pentadbir Pemantau (Read-Only)'}
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight">
            Selamat Datang, {user?.full_name}
          </h2>
          <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pusat Kawalan & Pemantauan Kehadiran Pengetua dan Guru Besar (PGB) bagi Pejabat Pendidikan Daerah Tuaran.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {user?.role === 'SUPER_ADMIN' && (
            <Button
              variant="teal"
              size="sm"
              onClick={() => onNavigate('/admin/approver-assignments')}
              icon={<CalendarCheck className="w-4 h-4" />}
            >
              Penetapan Pengesah
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => onNavigate('/admin/monthly-verification')}
            icon={<FileCheck2 className="w-4 h-4" />}
          >
            Semakan Bulanan
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 w-full md:w-auto">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Penapis Papan Pemuka:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Time range toggle */}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setTimeFilter('TODAY')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeFilter === 'TODAY'
                  ? 'bg-white font-bold text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeFilter('WEEK')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeFilter === 'WEEK'
                  ? 'bg-white font-bold text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setTimeFilter('MONTH')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeFilter === 'MONTH'
                  ? 'bg-white font-bold text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            {user?.role === 'SUPER_ADMIN' || user?.role === 'MONITORING_ADMIN' ? (
              <option value="ALL">Semua 6 Zon Pentadbiran</option>
            ) : null}
            {accessibleZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.code} — {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 8 Summary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Jumlah Sekolah */}
        <StatCard
          title="1. Jumlah Sekolah"
          value={stats.totalSchools}
          subtitle="Sekolah Berdaftar PPD Tuaran"
          icon={<School className="w-5 h-5" />}
          variant="blue"
          onClick={() => onNavigate('/admin/schools')}
        />

        {/* 2. Jumlah PGB */}
        <StatCard
          title="2. Pengetua & Guru Besar"
          value={stats.totalPgb}
          subtitle="PGB Berdaftar Aktif"
          icon={<Users className="w-5 h-5" />}
          variant="purple"
          onClick={() => onNavigate('/admin/users')}
        />

        {/* 3. Kehadiran Hari Ini */}
        <StatCard
          title="3. Kehadiran Hari Ini"
          value={`${stats.attendanceTodayCount} (${stats.attendanceTodayPercentage}%)`}
          subtitle="Telah Mengimbas Kehadiran"
          icon={<CheckCircle className="w-5 h-5" />}
          variant="emerald"
          trend={{ value: '+1.2%', isPositive: true }}
          onClick={() => onNavigate('/admin/attendance/monitoring')}
        />

        {/* 4. Belum Clock-In */}
        <StatCard
          title="4. Belum Clock-In"
          value={stats.notClockedInCount}
          subtitle="Belum Mengesahkan Kehadiran"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
          onClick={() => onNavigate('/admin/attendance/monitoring')}
        />

        {/* 5. Lewat Hadir */}
        <StatCard
          title="5. Lewat Hadir"
          value={stats.lateTodayCount}
          subtitle="Selepas Toleransi 07:45 AM"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="rose"
          onClick={() => onNavigate('/admin/attendance/monitoring')}
        />

        {/* 6. Rekod Tidak Lengkap */}
        <StatCard
          title="6. Rekod Tidak Lengkap"
          value={stats.incompleteRecordsCount}
          subtitle="Tiada Clock-Out / Luar Geofence"
          icon={<FileQuestion className="w-5 h-5" />}
          variant="slate"
          onClick={() => onNavigate('/admin/attendance/monitoring')}
        />

        {/* 7. Justifikasi Menunggu Semakan */}
        <StatCard
          title="7. Justifikasi Menunggu"
          value={stats.pendingJustificationsCount}
          subtitle="Rayuan Memerlukan Semakan"
          icon={<FileCheck2 className="w-5 h-5" />}
          variant="amber"
          onClick={() => onNavigate('/admin/attendance/justifications')}
        />

        {/* 8. Pengesahan Bulanan Menunggu */}
        <StatCard
          title="8. Pengesahan Bulanan Menunggu"
          value={stats.pendingMonthlyVerificationCount}
          subtitle="Laporan Bulanan Menunggu Verifikasi"
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="blue"
          onClick={() => onNavigate('/admin/monthly-verification')}
        />
      </div>

      {/* Visual Analytics Charts */}
      <AttendanceCharts zones={zones} />

      {/* 6 Zones Infographic Summary Cards Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Ringkasan 6 Zon Pentadbiran PPD Tuaran
            </h3>
            <p className="text-xs text-slate-500">
              Setiap sekolah diletakkan di bawah satu daripada 6 zon rasmi
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/admin/zones')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Urus Zon
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all hover:shadow-sm"
              style={{ borderLeftWidth: '5px', borderLeftColor: zone.color_hex }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: zone.color_hex }}>
                  {zone.code}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${zone.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {zone.is_active ? 'Aktif' : 'Nyahaktif'}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-2">{zone.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{zone.assigned_admin_name || 'Belum Ditetapkan'}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Sekolah:</span>{' '}
                  <span className="font-bold text-slate-800">{zone.total_schools || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">PGB:</span>{' '}
                  <span className="font-bold text-slate-800">{zone.total_pgb || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Kadar:</span>{' '}
                  <span className="font-bold text-emerald-600">98%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

