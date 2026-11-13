import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  ScanFace,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
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
import { getLocalDateStr, formatShortTime } from '@/lib/dateUtils';
import { AttendanceLocationModal } from './AttendanceLocationModal';

export const AttendanceMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const todayStr = getLocalDateStr();
  const [filterDate, setFilterDate] = useState<string>(todayStr);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordForMap, setSelectedRecordForMap] = useState<AttendanceRecord | null>(null);

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
    const exportData = filteredRecords.map((r) => {
      const inMs = r.clock_in_time ? new Date(r.clock_in_time).getTime() : 0;
      const outMs = r.clock_out_time ? new Date(r.clock_out_time).getTime() : 0;
      const actualMins = (inMs > 0 && outMs >= inMs)
        ? Math.max(1, Math.round((outMs - inMs) / 60000))
        : (r.total_working_minutes || 0);
      const shortfallMins = r.clock_out_time ? Math.max(0, 540 - actualMins) : 0;

      return {
        Tarikh: r.date,
        Nama_PGB: r.pgb_name,
        Sekolah: r.school_name,
        Zon: r.zone_name,
        Waktu_Masuk: formatShortTime(r.clock_in_time),
        Waktu_Keluar: formatShortTime(r.clock_out_time),
        Jumlah_Jam: `${Math.floor(actualMins / 60)}j ${actualMins % 60}m`,
        Kekurangan_Masa: shortfallMins > 0 ? `${Math.floor(shortfallMins / 60)}j ${shortfallMins % 60}m` : '0m',
        Minit_Lewat: r.late_minutes,
        Status: r.status,
        Wajah_Sah: r.face_verified ? 'Ya' : 'Tidak',
        GPS_Sah: r.gps_validated ? 'Ya' : 'Tidak',
      };
    });
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
                  const inMs = rec.clock_in_time ? new Date(rec.clock_in_time).getTime() : 0;
                  const outMs = rec.clock_out_time ? new Date(rec.clock_out_time).getTime() : 0;

                  let durationMinutes = 0;
                  let isCurrentlyWorking = false;
                  let remainingMinutes = 0;

                  if (inMs > 0 && outMs >= inMs) {
                    durationMinutes = Math.max(1, Math.round((outMs - inMs) / 60000));
                  } else if (inMs > 0 && !rec.clock_out_time) {
                    durationMinutes = Math.max(0, Math.floor((Date.now() - inMs) / 60000));
                    isCurrentlyWorking = true;
                    remainingMinutes = Math.max(0, 540 - durationMinutes);
                  } else {
                    durationMinutes = rec.total_working_minutes || 0;
                  }

                  const hours = Math.floor(durationMinutes / 60);
                  const mins = durationMinutes % 60;
                  const shortfallMinutes = Math.max(0, 540 - durationMinutes);
                  const sfH = Math.floor(shortfallMinutes / 60);
                  const sfM = shortfallMinutes % 60;

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
                              {formatShortTime(rec.clock_in_time)}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedRecordForMap(rec)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 mt-0.5 truncate max-w-[150px] text-left font-medium"
                              title="Klik untuk lihat peta GPS Clock-In"
                            >
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{rec.clock_in_location || 'Dalam Geofence'}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Masuk</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {rec.clock_out_time ? (
                          <div>
                            <div className="font-mono font-bold text-slate-900">
                              {formatShortTime(rec.clock_out_time)}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedRecordForMap(rec)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 mt-0.5 truncate max-w-[150px] text-left font-medium"
                              title="Klik untuk lihat peta GPS Clock-Out"
                            >
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{rec.clock_out_location || 'Dalam Geofence'}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Keluar</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">
                          {rec.clock_in_time ? `${hours} jam ${mins} min` : '-'}
                        </div>
                        {rec.clock_out_time ? (
                          durationMinutes >= 540 ? (
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              ✓ Cukup 9 Jam
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              Kurang {sfH > 0 ? `${sfH}j ` : ''}{sfM}m
                            </span>
                          )
                        ) : isCurrentlyWorking ? (
                          <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1 mt-0.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block shrink-0" />
                            Sedang Bertugas (Baki {Math.floor(remainingMinutes / 60)}j {remainingMinutes % 60}m)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Sasaran: 9 Jam
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5">
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

                          {/* Dedicated Map Location Inspection Button */}
                          {(rec.clock_in_time || rec.clock_out_time) && (
                            <button
                              type="button"
                              onClick={() => setSelectedRecordForMap(rec)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-semibold transition-colors shadow-xs"
                            >
                              <MapPin className="w-3 h-3 text-blue-600" />
                              <span>Lihat Peta</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {rec.clock_out_time ? (
                          durationMinutes >= 540 ? (
                            <Badge variant="success" size="sm">Lengkap (9 Jam)</Badge>
                          ) : rec.justification_status === 'DISAHKAN' || rec.justification_status === 'DILULUSKAN' ? (
                            <Badge variant="success" size="sm">Lengkap (Berjustifikasi)</Badge>
                          ) : rec.justification_status === 'MENUNGGU_SEMAKAN' ? (
                            <Badge variant="primary" size="sm">Menunggu Semakan</Badge>
                          ) : rec.justification_status === 'DITOLAK' ? (
                            <Badge variant="danger" size="sm">Justifikasi Ditolak</Badge>
                          ) : (
                            <Badge variant="danger" size="sm">Tidak Lengkap (Kurang Jam)</Badge>
                          )
                        ) : isCurrentlyWorking ? (
                          <Badge variant="primary" size="sm">Sedang Bertugas</Badge>
                        ) : (
                          getStatusBadge(rec.status)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Location GPS & Geofence Modal */}
      <AttendanceLocationModal
        record={selectedRecordForMap}
        isOpen={!!selectedRecordForMap}
        onClose={() => setSelectedRecordForMap(null)}
      />
    </div>
  );
};

