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
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // November
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  if (!user) return null;

  const malayMonths = [
    'Januari',
    'Februari',
    'Mac',
    'April',
    'Mei',
    'Jun',
    'Julai',
    'Ogos',
    'September',
    'Oktober',
    'November',
    'Disember',
  ];

  // Retrieve monthly summaries from db
  const allSummaries = dbService.getMonthlySummaries();
  const userSummary = allSummaries.find(
    (s) => s.user_id === user.id && s.month === selectedMonth && s.year === selectedYear
  );

  // Retrieve assigned approver for this school / zone
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
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Laporan Pengesahan Bulanan
          </h2>
          <p className="text-xs text-slate-400">
            Penjanaan automatik agregasi bulanan dan status semakan oleh Pegawai Pengesah (Admin Zon).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
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
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4" />
            Muat Turun PDF
          </button>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="p-5 rounded-3xl bg-[#0b1322] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mod Penghantaran: Automatik (Sistem Dijadualkan)
            </span>
            <h3 className="text-base font-bold text-white">
              Status Verifikasi Bulan {malayMonths[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>

          <div>
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {userSummary?.status || 'DISAHKAN'}
            </span>
          </div>
        </div>

        {/* Assigned Approver Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[11px]">Pegawai Pengesah Ditugaskan:</span>
            <p className="font-bold text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              {assignedApprover?.assigned_admin_name || 'Ustaz Azman bin Harun (Admin Zon)'}
            </p>
            <p className="text-[10px] text-slate-400">
              Pejabat Pendidikan Daerah Tuaran
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[11px]">Tarikh Dijana & Disahkan:</span>
            <p className="font-bold text-slate-200">
              {userSummary?.verified_at
                ? new Date(userSummary.verified_at).toLocaleDateString('ms-MY', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '1 November 2026 (Penjanaan Automatik)'}
            </p>
            <p className="text-[10px] text-emerald-400">
              Semua rekod telah dikunci daripada sebarang pindaan manual.
            </p>
          </div>
        </div>

        {/* Admin Comments */}
        {userSummary?.verification_remarks && (
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold block mb-1">
              Catatan Pengesah (Admin Zon):
            </span>
            <p className="text-slate-200 italic">
              "{userSummary.verification_remarks}"
            </p>
          </div>
        )}
      </div>

      {/* Aggregated Monthly Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block">Hari Bekerja</span>
          <span className="text-xl font-black text-white">{stats.totalWorkingDays}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block">Kehadiran Lengkap</span>
          <span className="text-xl font-black text-emerald-400">{stats.completedDays}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block">Jumlah Jam</span>
          <span className="text-xl font-black text-sky-400">{stats.totalHoursFormatted}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block">Justifikasi</span>
          <span className="text-xl font-black text-amber-400">{stats.needsJustificationCount}</span>
        </div>
      </div>
    </div>
  );
};
