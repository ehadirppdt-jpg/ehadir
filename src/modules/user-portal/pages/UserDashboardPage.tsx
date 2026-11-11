import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  School,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { AttendanceRecord } from '@/types';
import { AttendanceActionModal } from '../components/AttendanceActionModal';

interface UserDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'IN' | 'OUT'>('IN');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Today's Date in Malay
  const today = new Date();
  const malayDays = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
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
  const dateFormatted = `${malayDays[today.getDay()]}, ${today.getDate()} ${malayMonths[today.getMonth()]} ${today.getFullYear()}`;

  // Fetch today's attendance record for current PGB
  useEffect(() => {
    if (user) {
      const rec = dbService.getUserTodayAttendance(user.id);
      setTodayRecord(rec);
    }
  }, [user, refreshTrigger]);

  if (!user) return null;

  // Monthly stats from db
  const monthlyStats = dbService.getUserMonthlyStats(user.id, today.getMonth() + 1, today.getFullYear());
  const pendingJustifications = dbService
    .getUserJustifications(user.id)
    .filter((j) => j.status === 'MENUNGGU_SEMAKAN');

  const handleOpenAction = (action: 'IN' | 'OUT') => {
    setModalAction(action);
    setModalOpen(true);
  };

  // Determine today's attendance state
  const hasClockedIn = !!todayRecord?.clock_in_time;
  const hasClockedOut = !!todayRecord?.clock_out_time;

  return (
    <div className="space-y-6">
      {/* Top Greeting Section matching exact mockup */}
      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          SELAMAT DATANG
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Dashboard Saya
        </h2>
        <p className="text-sm text-slate-300 font-medium">
          Pengetua / Guru Besar · {user.school_name || 'Sekolah anda'}
        </p>
      </section>

      {/* Kehadiran Hari Ini Section matching exact mockup */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            Kehadiran Hari Ini
          </h3>

          {/* Right Status Pill Badge */}
          {!hasClockedIn ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Belum Clock-In
            </span>
          ) : !hasClockedOut ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/70 border border-sky-500/40 text-sky-400 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Sedang Bertugas
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Kehadiran Lengkap
            </span>
          )}
        </div>

        {/* Two Main Action Cards side-by-side matching mockup */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* REKOD MASUK */}
          <button
            type="button"
            onClick={() => handleOpenAction('IN')}
            disabled={hasClockedIn}
            className={`group rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all ${
              hasClockedIn
                ? 'bg-slate-900/40 border border-slate-800/60 opacity-60 cursor-not-allowed'
                : 'bg-[#0b1322] border border-slate-800 hover:border-emerald-500/60 hover:bg-[#0c182c] shadow-lg active:scale-95'
            }`}
          >
            {/* Green In Arrow Icon */}
            <div className="text-emerald-400 text-2xl font-black mb-2 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-2xl leading-none">→]</span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
              REKOD MASUK
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              {hasClockedIn ? `Direkod ${todayRecord?.clock_in_time}` : 'Pengesahan wajah + GPS'}
            </p>
          </button>

          {/* REKOD KELUAR */}
          <button
            type="button"
            onClick={() => handleOpenAction('OUT')}
            disabled={!hasClockedIn || hasClockedOut}
            className={`group rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all ${
              !hasClockedIn || hasClockedOut
                ? 'bg-slate-900/40 border border-slate-800/60 opacity-60 cursor-not-allowed'
                : 'bg-[#0b1322] border border-slate-800 hover:border-sky-500/60 hover:bg-[#0c182c] shadow-lg active:scale-95'
            }`}
          >
            {/* Sky Blue Out Arrow Icon */}
            <div className="text-sky-400 text-2xl font-black mb-2 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-2xl leading-none">[→</span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
              REKOD KELUAR
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              {hasClockedOut
                ? `Direkod ${todayRecord?.clock_out_time}`
                : hasClockedIn
                ? 'Cukup 9 jam (540 minit)'
                : 'Pengesahan wajah + GPS'}
            </p>
          </button>
        </div>

        {/* Live Attendance Details Card if clocked in */}
        {hasClockedIn && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Waktu Masuk: <strong className="text-white">{todayRecord?.clock_in_time}</strong>
                </span>
                {todayRecord?.clock_out_time && (
                  <>
                    <span>•</span>
                    <span>
                      Waktu Keluar: <strong className="text-white">{todayRecord.clock_out_time}</strong>
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span className="truncate max-w-xs">{todayRecord?.location_name || user.school_name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block">Jumlah Bertugas</span>
                <span className="text-xs font-bold text-emerald-400">
                  {todayRecord?.work_duration_minutes
                    ? `${Math.floor(todayRecord.work_duration_minutes / 60)}j ${todayRecord.work_duration_minutes % 60}m`
                    : 'Sedang Berjalan (Sasaran 9 Jam)'}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Statistik Bulanan Section matching exact mockup */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            Statistik Bulanan
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {malayMonths[today.getMonth()]} {today.getFullYear()}
          </span>
        </div>

        {/* 4 Cards with top colored accent line */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Kehadiran lengkap (Green Accent) */}
          <div className="bg-[#081816]/70 border border-emerald-950/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Green Top Line */}
              <div className="h-1 w-10 bg-emerald-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-white">
                {monthlyStats.completedDays} <span className="text-xs font-semibold text-slate-400">Hari</span>
              </p>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-2">
              Kehadiran lengkap
            </p>
          </div>

          {/* Card 2: Jumlah jam bekerja (Blue Accent) */}
          <div className="bg-[#091526]/70 border border-sky-950/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Sky Blue Top Line */}
              <div className="h-1 w-10 bg-sky-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-white">
                {monthlyStats.totalHoursFormatted}
              </p>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-2">
              Jumlah jam bekerja
            </p>
          </div>

          {/* Card 3: Jumlah lewat (Amber Accent) */}
          <div className="bg-[#1a1407]/70 border border-amber-950/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Amber Top Line */}
              <div className="h-1 w-10 bg-amber-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-white">
                {monthlyStats.lateDays} <span className="text-xs font-semibold text-slate-400">Hari</span>
              </p>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-2">
              Jumlah lewat
            </p>
          </div>

          {/* Card 4: Perlu justifikasi (Rose Accent) */}
          <div className="bg-[#1a0a0f]/70 border border-rose-950/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Rose Top Line */}
              <div className="h-1 w-10 bg-rose-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-white">
                {monthlyStats.needsJustificationCount}{' '}
                <span className="text-xs font-semibold text-slate-400">Rekod</span>
              </p>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-2">
              Perlu justifikasi
            </p>
          </div>
        </div>
      </section>

      {/* Quick Alerts Banner */}
      {pendingJustifications.length > 0 && (
        <section className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-200">
                {pendingJustifications.length} Permohonan Justifikasi Sedang Disemak
              </p>
              <p className="text-[11px] text-amber-300/80">
                Admin Zon sedang menyemak dokumen sokongan anda.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/user/justifications')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shrink-0 transition-colors"
          >
            Semak
          </button>
        </section>
      )}

      {/* Information Cards: Geofence Rules */}
      <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Peraturan & Lokasi Dibenarkan</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Sesuai dengan arahan pentadbiran PPD Tuaran, setiap PGB wajib menyempurnakan tempoh bertugas minimum{' '}
          <strong className="text-slate-200">9 jam sehari (540 minit)</strong>. Kehadiran hanya sah
          direkodkan di dua zon rasmi:{' '}
          <strong className="text-slate-200">{user.school_name}</strong> atau{' '}
          <strong className="text-slate-200">Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)</strong>.
        </p>
      </section>

      {/* Modal for Clock-In & Clock-Out */}
      <AttendanceActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={modalAction}
        user={user}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
};

