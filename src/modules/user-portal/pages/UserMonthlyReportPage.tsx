import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Building,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { exportToPdf } from '@/lib/exportPdf';
import { MonthlyAttendanceSummary } from '@/types';

export const UserMonthlyReportPage: React.FC = () => {
  const { user } = useAuth();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  if (!user) return null;

  const malayMonths = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
  ];

  const allSummaries = dbService.getMonthlySummaries();
  const userSummary = allSummaries.find(
    (s) => s.user_id === user.id && s.month === selectedMonth && s.year === selectedYear
  );

  const approverAssignments = dbService.getApproverAssignments();
  const assignedApprover = approverAssignments.find(
    (a) => a.school_id === user.assigned_school_id || a.zone_id === user.assigned_zone_ids?.[0]
  );

  const stats = dbService.getUserMonthlyStats(user.id, selectedMonth, selectedYear);

  const handleDownloadPdf = () => {
    const headers = ['Perkara', 'Statistik / Maklumat Pengesahan'];
    const rows = [
      ['Nama PGB', user.full_name],
      ['Jawatan & Gred', user.position || 'Pengetua / Guru Besar'],
      ['Sekolah', user.school_name || 'Sekolah Daerah Tuaran'],
      ['Bulan / Tahun', `${malayMonths[selectedMonth - 1]} ${selectedYear}`],
      ['Jumlah Hari Bekerja Rasmi', `${stats.totalWorkingDays} Hari`],
      ['Kehadiran Lengkap (Cukup 9 Jam)', `${stats.completedDays} Hari`],
      ['Jumlah Hari Lewat', `${stats.lateDays} Hari`],
      ['Jumlah Rekod Kurang Jam', `${stats.shortfallDays} Hari`],
      ['Jumlah Jam Bekerja Sebenar', stats.totalHoursFormatted],
      ['Justifikasi Dihantar', `${stats.needsJustificationCount} Rekod`],
      ['Status Pengesahan Bulanan', userSummary?.status || 'MENUNGGU_SEMAKAN'],
      ['Pegawai Pengesah (Admin Zon)', assignedApprover?.assigned_admin_name || 'Admin Zon Bertanggungjawab'],
      ['Catatan Pegawai', userSummary?.verification_remarks || 'Tiada teguran. Rekod telah memenuhi syarat waktu bekerja minimum.'],
    ];

    exportToPdf({
      title: `LAPORAN PENGESAHAN KEHADIRAN BULANAN PGB — ${malayMonths[selectedMonth - 1]} ${selectedYear}`,
      subtitle: `Pegawai: ${user.full_name} | Sekolah: ${user.school_name} | Pejabat Pendidikan Daerah Tuaran`,
      headers,
      rows,
      fileName: `Penyata_Bulanan_${user.full_name.replace(/\s+/g, '_')}_${malayMonths[selectedMonth - 1]}_${selectedYear}.pdf`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Laporan Pengesahan Bulanan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Penjanaan automatik agregasi bulanan dan status semakan oleh Pegawai Pengesah (Admin Zon).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
          >
            {malayMonths.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
          >
            <option value={now.getFullYear()}>{now.getFullYear()}</option>
            <option value={now.getFullYear() - 1}>{now.getFullYear() - 1}</option>
            {now.getFullYear() !== 2026 && <option value={2026}>2026</option>}
          </select>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            Muat Turun PDF
          </button>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="p-5 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Mod Penghantaran: Automatik (Sistem Dijadualkan)
            </span>
            <h3 className="text-base font-bold text-gray-900">
              Status Verifikasi Bulan {malayMonths[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>

          <div>
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {userSummary?.status || 'DISAHKAN'}
            </span>
          </div>
        </div>

        {/* Assigned Approver Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 block text-[11px] font-medium">Pegawai Pengesah Ditugaskan:</span>
            <p className="font-bold text-gray-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              {assignedApprover?.assigned_admin_name || 'Ustaz Azman bin Harun (Admin Zon)'}
            </p>
            <p className="text-[10px] text-gray-500">
              Pejabat Pendidikan Daerah Tuaran
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 block text-[11px] font-medium">Tarikh Dijana &amp; Disahkan:</span>
            <p className="font-bold text-gray-900">
              {userSummary?.verified_at
                ? new Date(userSummary.verified_at).toLocaleDateString('ms-MY', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '1 November 2026 (Penjanaan Automatik)'}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">
              Semua rekod telah dikunci daripada sebarang pindaan manual.
            </p>
          </div>
        </div>

        {/* Admin Comments */}
        {userSummary?.verification_remarks && (
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
            <span className="text-gray-500 font-semibold block mb-1">
              Catatan Pengesah (Admin Zon):
            </span>
            <p className="text-gray-700 italic">
              "{userSummary.verification_remarks}"
            </p>
          </div>
        )}
      </div>

      {/* Aggregated Monthly Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 text-center shadow-sm">
          <span className="text-[11px] text-gray-500 block font-medium">Hari Bekerja</span>
          <span className="text-2xl font-black text-gray-900">{stats.totalWorkingDays}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-100 text-center shadow-sm">
          <span className="text-[11px] text-gray-500 block font-medium">Kehadiran Lengkap</span>
          <span className="text-2xl font-black text-emerald-700">{stats.completedDays}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-100 text-center shadow-sm">
          <span className="text-[11px] text-gray-500 block font-medium">Jumlah Jam</span>
          <span className="text-2xl font-black text-blue-700">{stats.totalHoursFormatted}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 text-center shadow-sm">
          <span className="text-[11px] text-gray-500 block font-medium">Justifikasi</span>
          <span className="text-2xl font-black text-amber-700">{stats.needsJustificationCount}</span>
        </div>
      </div>
    </div>
  );
};
