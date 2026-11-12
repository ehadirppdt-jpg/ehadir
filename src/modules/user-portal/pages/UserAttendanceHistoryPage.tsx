import React, { useState } from 'react';
import {
  Clock,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { exportToPdf } from '@/lib/exportPdf';
import { AttendanceRecord } from '@/types';
import { formatLocalTime } from '@/lib/dateUtils';

export const UserAttendanceHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!user) return null;

  const records = dbService.getUserAttendanceRecords(user.id);

  // Filter records
  const filteredRecords = records.filter((rec) => {
    if (selectedYear !== 'ALL' && !rec.date.startsWith(selectedYear)) return false;
    if (selectedMonth !== 'ALL') {
      const monthStr = rec.date.substring(5, 7);
      if (monthStr !== selectedMonth) return false;
    }
    if (selectedStatus !== 'ALL' && rec.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDate = rec.date.toLowerCase().includes(q);
      const matchLoc = rec.location_name?.toLowerCase().includes(q);
      if (!matchDate && !matchLoc) return false;
    }
    return true;
  });

  const handleExportPdf = () => {
    const headers = [
      'Tarikh',
      'Hari',
      'Masa Masuk',
      'Masa Keluar',
      'Tempoh Bertugas',
      'Kekurangan (Minit)',
      'Lokasi Rekod',
      'Status',
    ];

    const daysMalay: { [key: number]: string } = {
      0: 'Ahad',
      1: 'Isnin',
      2: 'Selasa',
      3: 'Rabu',
      4: 'Khamis',
      5: 'Jumaat',
      6: 'Sabtu',
    };

    const rows = filteredRecords.map((r) => {
      const d = new Date(r.date);
      const dayName = daysMalay[d.getDay()] || '';
      const durationStr = r.work_duration_minutes
        ? `${Math.floor(r.work_duration_minutes / 60)}j ${r.work_duration_minutes % 60}m`
        : '-';

      return [
        r.date,
        dayName,
        formatLocalTime(r.clock_in_time),
        formatLocalTime(r.clock_out_time),
        durationStr,
        r.shortfall_minutes || 0,
        r.location_name || user.school_name || 'Sekolah',
        r.status || 'LENGKAP',
      ];
    });

    exportToPdf({
      title: `PENYATA SEJARAH KEHADIRAN PGB — ${user.full_name}`,
      subtitle: `Sekolah: ${user.school_name} | Kod: ${user.id} | Sasaran Bertugas: Minimum 9 Jam Sehari`,
      headers,
      rows,
      fileName: `sejarah-kehadiran-${user.id}-${new Date().toISOString().split('T')[0]}.pdf`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Sejarah Kehadiran
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Log lengkap rekod kehadiran PGB dengan pengesahan wajah biometrik dan koordinat GPS.
          </p>
        </div>

        <button
          onClick={handleExportPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-auto active:scale-95"
        >
          <Download className="w-4 h-4" />
          Eksport Penyata PDF
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Tapis &amp; Carian Rekod:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Date */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tarikh (cth: 2026-11)..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Month filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Bulan</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Mac</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Jun</option>
            <option value="07">Julai</option>
            <option value="08">Ogos</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Disember</option>
          </select>

          {/* Year filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="LENGKAP">Kehadiran Lengkap (9 Jam)</option>
            <option value="LEWAT">Hadir Lewat</option>
            <option value="KURANG_JAM">Kekurangan Jam</option>
            <option value="TIDAK_LENGKAP">Tidak Lengkap</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tarikh &amp; Hari</th>
                <th className="py-3 px-4">Waktu Masuk</th>
                <th className="py-3 px-4">Waktu Keluar</th>
                <th className="py-3 px-4">Jumlah Jam</th>
                <th className="py-3 px-4">Lokasi Geofence</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-gray-300" />
                      <span>Tiada rekod kehadiran yang sepadan dengan tapisan dipilih.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const d = new Date(r.date);
                  const daysMalay = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
                  const dayName = daysMalay[d.getDay()];

                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{r.date}</span>
                        <span className="text-[10px] text-gray-400">{dayName}</span>
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-semibold font-mono text-xs">
                        {formatLocalTime(r.clock_in_time)}
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-semibold font-mono text-xs">
                        {formatLocalTime(r.clock_out_time)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900">
                          {r.work_duration_minutes
                            ? `${Math.floor(r.work_duration_minutes / 60)}j ${r.work_duration_minutes % 60}m`
                            : '-'}
                        </span>
                        {r.shortfall_minutes ? (
                          <span className="text-[10px] text-rose-600 block font-semibold">
                            Kurang {r.shortfall_minutes} minit
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {r.location_name || user.school_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.status === 'LENGKAP'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {r.status === 'LENGKAP' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
