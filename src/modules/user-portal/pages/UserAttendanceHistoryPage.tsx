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
    // Year filter
    if (selectedYear !== 'ALL' && !rec.date.startsWith(selectedYear)) {
      return false;
    }
    // Month filter
    if (selectedMonth !== 'ALL') {
      const monthStr = rec.date.substring(5, 7);
      if (monthStr !== selectedMonth) return false;
    }
    // Status filter
    if (selectedStatus !== 'ALL' && rec.status !== selectedStatus) {
      return false;
    }
    // Search query
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
      fileName: `Laporan_Kehadiran_${user.full_name.replace(/\s+/g, '_')}_${selectedYear}.pdf`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sejarah Kehadiran
          </h2>
          <p className="text-xs text-slate-400">
            Log lengkap rekod kehadiran PGB dengan pengesahan wajah biometrik dan koordinat GPS.
          </p>
        </div>

        <button
          onClick={handleExportPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Eksport Penyata PDF
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0b1322] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Tapis & Carian Rekod:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Date */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tarikh (cth: 2026-11)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Month filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
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
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
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
      <div className="bg-[#0b1322] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tarikh & Hari</th>
                <th className="py-3 px-4">Waktu Masuk</th>
                <th className="py-3 px-4">Waktu Keluar</th>
                <th className="py-3 px-4">Jumlah Jam</th>
                <th className="py-3 px-4">Lokasi Geofence</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tiada rekod kehadiran yang sepadan dengan tapisan dipilih.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const d = new Date(r.date);
                  const daysMalay = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
                  const dayName = daysMalay[d.getDay()];

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{r.date}</span>
                        <span className="text-[10px] text-slate-400">{dayName}</span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold font-mono text-xs">
                        {formatLocalTime(r.clock_in_time)}
                      </td>
                      <td className="py-3 px-4 text-sky-400 font-semibold font-mono text-xs">
                        {formatLocalTime(r.clock_out_time)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-200">
                          {r.work_duration_minutes
                            ? `${Math.floor(r.work_duration_minutes / 60)}j ${r.work_duration_minutes % 60}m`
                            : '-'}
                        </span>
                        {r.shortfall_minutes ? (
                          <span className="text-[10px] text-rose-400 block">
                            Kurang {r.shortfall_minutes} minit
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {r.location_name || user.school_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'LENGKAP'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
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
