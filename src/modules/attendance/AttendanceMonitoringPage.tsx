import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  ScanFace,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Filter,
  FileSpreadsheet,
  Calendar,
  Building,
  School as SchoolIcon,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { AttendanceRecord, Zone, School, AttendanceStatusType } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { exportToExcel } from '@/lib/exportExcel';

export const AttendanceMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState<string>(todayStr);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const zones = useMemo(() => dbService.getZones(), []);
  const [records, setRecords] = useState<AttendanceRecord[]>(() => dbService.getAttendanceRecords());

  useEffect(() => {
    dbService.syncAttendanceRecordsFromSupabase().then((synced) => {
      setRecords(synced);
    });
  }, []);

  // Filter attendance records based on role (Admin Zon only sees assigned zones)
  const accessibleRecords = useMemo(() => {
    return records.filter((r) => {
      if (user?.role === 'SUPER_ADMIN' || user?.role === 'MONITORING_ADMIN') return true;
      if (user?.role === 'ADMIN_ZON') {
        const allowedZoneIds = new Set(user.assigned_zone_ids || []);
        return r.zone_id && allowedZoneIds.has(r.zone_id);
      }
      return false;
    });
  }, [records, user]);

  const filteredRecords = useMemo(() => {
    return accessibleRecords.filter((r) => {
      const matchesSearch =
        r.pgb_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.school_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = !filterDate || r.date === filterDate;
      const matchesZone = selectedZone === 'ALL' || r.zone_id === selectedZone;
      const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchesSearch && matchesDate && matchesZone && matchesStatus;
    });
  }, [accessibleRecords, searchQuery, filterDate, selectedZone, selectedStatus]);

  const handleExport = () => {
    const exportData = filteredRecords.map((r) => ({
      Tarikh: r.date,
      Nama_PGB: r.pgb_name,
      Sekolah: r.school_name,
      Zon: r.zone_name,
      Waktu_Masuk: r.clock_in_time ? new Date(r.clock_in_time).toLocaleTimeString('ms-MY') : '-',
      Waktu_Keluar: r.clock_out_time ? new Date(r.clock_out_time).toLocaleTimeString('ms-MY') : '-',
      Jumlah_Jam: `${Math.floor(r.total_working_minutes / 60)}j ${r.total_working_minutes % 60}m`,
      Minit_Lewat: r.late_minutes,
      Status: r.status,
      Wajah_Sah: r.face_verified ? 'Ya' : 'Tidak',
      GPS_Sah: r.gps_validated ? 'Ya' : 'Tidak',
    }));
    exportToExcel(exportData, `Pemantauan_Kehadiran_${filterDate}`, 'Kehadiran');
    showToast('Rekod kehadiran berjaya dieksport ke Excel.', 'success');
  };

  const getStatusBadge = (status: AttendanceStatusType) => {
    switch (status) {
      case 'LENGKAP':
        return <Badge variant="success" size="sm">Lengkap</Badge>;
      case 'LEWAT':
        return <Badge variant="warning" size="sm">Lewat Hadir</Badge>;
      case 'TIDAK_LENGKAP':
        return <Badge variant="danger" size="sm">Tidak Lengkap</Badge>;
      case 'PERLU_JUSTIFIKASI':
        return <Badge variant="amber" size="sm">Perlu Justifikasi</Badge>;
      case 'MENUNGGU_SEMAKAN':
        return <Badge variant="primary" size="sm">Menunggu Semakan</Badge>;
      case 'DISAHKAN':
        return <Badge variant="success" size="sm">Disahkan</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Pemantauan Kehadiran Harian PGB
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status clock-in, clock-out, pengesahan GPS geofence, dan imbasan wajah biometrik Pengetua dan Guru Besar.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
        >
          Eksport Rekod Harian
        </Button>
      </div>

      {/* Dasar Kehadiran Fleksi PGB (9 Jam) Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center gap-3 text-xs text-blue-900 shadow-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="leading-relaxed">
          <strong>Peraturan Kehadiran PGB:</strong> Tiada masa rasmi clock-in ditetapkan (fleksi). Kehadiran dikira sah dan lengkap sebaik sahaja mencukupi tempoh bertugas minimum <strong>9 jam (540 minit)</strong> sehari.
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari mengikut nama PGB atau sekolah..."
          className="w-full md:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Zone filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="ALL">Semua Zon</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.code} — {z.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="ALL">Semua Status</option>
            <option value="LENGKAP">Lengkap</option>
            <option value="LEWAT">Lewat</option>
            <option value="TIDAK_LENGKAP">Tidak Lengkap</option>
            <option value="PERLU_JUSTIFIKASI">Perlu Justifikasi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <EmptyState
            title="Tiada Rekod Kehadiran"
            description="Tiada rekod kehadiran yang direkodkan bagi tarikh atau penapis yang dipilih."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Pengetua / Guru Besar</th>
                  <th className="px-4 py-3.5">Sekolah & Zon</th>
                  <th className="px-4 py-3.5">Clock-In</th>
                  <th className="px-4 py-3.5">Clock-Out</th>
                  <th className="px-4 py-3.5">Tempoh Bertugas</th>
                  <th className="px-4 py-3.5">Pengesahan GPS & Wajah</th>
                  <th className="px-4 py-3.5">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const hours = Math.floor(rec.total_working_minutes / 60);
                  const mins = rec.total_working_minutes % 60;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{rec.pgb_name}</div>
                        <div className="text-[11px] text-slate-500">{rec.date}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{rec.school_name}</div>
                        <div className="text-[10px] text-blue-600 font-semibold">{rec.zone_name}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        {rec.clock_in_time ? (
                          <div>
                            <div className="font-mono font-bold text-slate-900">
                              {new Date(rec.clock_in_time).toLocaleTimeString('ms-MY', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {rec.clock_in_location || 'Dalam Geofence'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Masuk</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {rec.clock_out_time ? (
                          <div>
                            <div className="font-mono font-bold text-slate-900">
                              {new Date(rec.clock_out_time).toLocaleTimeString('ms-MY', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {rec.clock_out_location || 'Dalam Geofence'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Keluar</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">
                          {hours} jam {mins} min
                        </div>
                        {rec.total_working_minutes >= 540 ? (
                          <span className="text-[10px] font-semibold text-emerald-600 block">
                            ✓ Cukup 9 Jam
                          </span>
                        ) : rec.clock_out_time ? (
                          <span className="text-[10px] font-semibold text-amber-600 block">
                            Kurang {540 - rec.total_working_minutes} min
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">
                            Sasaran: 9 Jam
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`p-1 rounded ${
                              rec.face_verified
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title={rec.face_verified ? 'Wajah Disahkan' : 'Wajah Tidak Dikesan'}
                          >
                            <ScanFace className="w-3.5 h-3.5" />
                          </span>

                          <span
                            className={`p-1 rounded ${
                              rec.gps_validated
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-rose-50 text-rose-600'
                            }`}
                            title={rec.gps_validated ? 'GPS Sah dalam Geofence' : 'Luar Radius'}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">{getStatusBadge(rec.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

