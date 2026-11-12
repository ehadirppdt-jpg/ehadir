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
  Timer,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { AttendanceRecord } from '@/types';
import { AttendanceActionModal } from '../components/AttendanceActionModal';
import {
  formatLocalTime,
  formatShortTime,
  formatSecondsToHms,
  formatDuration,
} from '@/lib/dateUtils';

interface UserDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'IN' | 'OUT'>('IN');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Live timer tick updated every second
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      const load = async () => {
        try {
          await dbService.syncAttendanceRecordsFromSupabase();
        } catch {}
        const rec = dbService.getUserTodayAttendance(user.id);
        setTodayRecord(rec);
      };
      load();
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

  // 9-Hour Target Calculation (540 minutes = 32,400 seconds)
  const targetWorkSeconds = 9 * 3600;

  let clockInDate: Date | null = null;
  let targetClockOutDate: Date | null = null;
  let elapsedSeconds = 0;
  let remainingSeconds = targetWorkSeconds;
  let isTargetReached = false;
  let progressPercent = 0;

  if (todayRecord?.clock_in_time) {
    clockInDate = new Date(todayRecord.clock_in_time);
    if (!isNaN(clockInDate.getTime())) {
      targetClockOutDate = new Date(clockInDate.getTime() + targetWorkSeconds * 1000);

      const referenceTime = todayRecord.clock_out_time
        ? new Date(todayRecord.clock_out_time).getTime()
        : currentTime.getTime();

      elapsedSeconds = Math.max(0, Math.floor((referenceTime - clockInDate.getTime()) / 1000));
      remainingSeconds = Math.max(0, targetWorkSeconds - elapsedSeconds);
      isTargetReached = elapsedSeconds >= targetWorkSeconds;
      progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / targetWorkSeconds) * 100));
    }
  }

  const isShortfallOnClockOut =
    hasClockedOut &&
    ((todayRecord?.shortfall_minutes !== undefined && todayRecord.shortfall_minutes > 0) ||
      todayRecord?.status === 'TIDAK_LENGKAP');

  const shortfallTotalMins =
    todayRecord?.shortfall_minutes ??
    (isTargetReached ? 0 : Math.max(1, Math.ceil(remainingSeconds / 60)));
  const shortfallHours = Math.floor(shortfallTotalMins / 60);
  const shortfallRemMins = shortfallTotalMins % 60;

  return (
    <div className="space-y-6">
      {/* Top Greeting Section */}
      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          SELAMAT DATANG
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Dashboard Saya
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          Pengetua / Guru Besar · {user.school_name || 'Sekolah anda'}
        </p>
      </section>

      {/* Live Date & Time Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Tarikh Hari Ini</p>
            <p className="text-lg font-black mt-0.5">{dateFormatted}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Masa Semasa</p>
            <p className="text-2xl font-black font-mono mt-0.5">
              {currentTime.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Kehadiran Hari Ini Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Kehadiran Hari Ini
          </h3>

          {/* Right Status Pill Badge */}
          {!hasClockedIn ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Belum Clock-In
            </span>
          ) : !hasClockedOut ? (
            isTargetReached ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Cukup 9 Jam (Sedia Keluar)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Bertugas ({formatSecondsToHms(remainingSeconds)})
              </span>
            )
          ) : isShortfallOnClockOut ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              Kekurangan Jam ({shortfallHours}j {shortfallRemMins}m)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              Kehadiran Lengkap (9 Jam)
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
                ? 'bg-gray-100 border border-gray-200 opacity-60 cursor-not-allowed'
                : 'bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md shadow-sm active:scale-95'
            }`}
          >
            {/* Green In Arrow Icon */}
            <div className="text-emerald-600 text-2xl font-black mb-2 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-2xl leading-none">→]</span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold tracking-wide text-gray-900 uppercase">
              REKOD MASUK
            </h4>
            <p className="text-[11px] text-gray-500 mt-1">
              {hasClockedIn
                ? <span className="text-emerald-600 font-semibold">Direkod {formatShortTime(todayRecord?.clock_in_time)}</span>
                : 'Pengesahan wajah + GPS'}
            </p>
          </button>

          {/* REKOD KELUAR */}
          <button
            type="button"
            onClick={() => handleOpenAction('OUT')}
            disabled={!hasClockedIn || hasClockedOut}
            className={`group rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all ${
              !hasClockedIn || hasClockedOut
                ? 'bg-gray-100 border border-gray-200 opacity-60 cursor-not-allowed'
                : 'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md shadow-sm active:scale-95'
            }`}
          >
            {/* Blue Out Arrow Icon */}
            <div className="text-blue-600 text-2xl font-black mb-2 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-2xl leading-none">[→</span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold tracking-wide text-gray-900 uppercase">
              REKOD KELUAR
            </h4>
            <p className="text-[11px] text-gray-500 mt-1">
              {hasClockedOut
                ? <span className="text-blue-600 font-semibold">Direkod {formatShortTime(todayRecord?.clock_out_time)}</span>
                : hasClockedIn
                ? isTargetReached
                  ? 'Genap 9 jam (Sedia Clock-Out)'
                  : `Berbaki ${formatSecondsToHms(remainingSeconds)}`
                : 'Pengesahan wajah + GPS'}
            </p>
          </button>
        </div>

        {/* 1. LIVE 9-HOUR COUNTDOWN TIMER CARD (When Clocked In and Not Clocked Out) */}
        {hasClockedIn && !hasClockedOut && (
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isTargetReached
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  <Timer
                    className={`w-6 h-6 ${!isTargetReached ? 'animate-pulse' : ''}`}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <span>Sasaran Waktu Bertugas: 9 Jam Fleksi</span>
                    {isTargetReached ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold">
                        SELESAI 9 JAM
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-bold">
                        PEMASA AKTIF
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Waktu Masuk:{' '}
                    <strong className="text-emerald-600">
                      {formatLocalTime(todayRecord?.clock_in_time)}
                    </strong>{' '}
                    • Sasaran Selesai:{' '}
                    <strong className="text-blue-600">
                      {formatLocalTime(targetClockOutDate?.toISOString())}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Digital Countdown Timer Display */}
              <div className="text-left sm:text-right bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">
                  {isTargetReached ? 'STATUS PENUH' : 'MASA BERBAKI'}
                </span>
                <span
                  className={`text-xl font-black font-mono tracking-wider ${
                    isTargetReached ? 'text-emerald-700' : 'text-blue-700'
                  }`}
                >
                  {isTargetReached ? '00:00:00' : formatSecondsToHms(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Telah Bertugas:{' '}
                  <strong className="text-gray-900 font-mono">
                    {formatSecondsToHms(elapsedSeconds)}
                  </strong>{' '}
                  / <span className="text-gray-400">09:00:00</span>
                </span>
                <span className="font-bold text-blue-600">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTargetReached
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Warning or Success Notice */}
            {!isTargetReached ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  <strong>Peringatan Kekurangan Jam:</strong> Jika anda Clock-Out sekarang (sebelum{' '}
                  {formatShortTime(targetClockOutDate?.toISOString())}), kehadiran anda akan dicatat
                  sebagai{' '}
                  <strong className="text-amber-700">
                    TIDAK LENGKAP (Kekurangan Jam: {shortfallHours}j {shortfallRemMins}m)
                  </strong>{' '}
                  dan memerlukan penghantaran justifikasi rasmi.
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Tahniah! Tempoh 9 jam bertugas telah dipenuhi sepenuhnya. Anda sedia untuk merekod
                  Clock-Out bila-bila masa.
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. SHORTFALL WARNING CARD (When Clocked Out Early with Shortfall) */}
        {hasClockedOut && isShortfallOnClockOut && (
          <div className="rounded-2xl p-4 sm:p-5 bg-amber-50 border border-amber-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-800">
                    Kekurangan Jam Bekerja Dikesan (Dasar 9 Jam PPD)
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Masa keluar direkodkan sebelum memenuhi genap 9 jam (540 minit).
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 shrink-0">
                KURANG {shortfallHours}j {shortfallRemMins}m
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500 text-[10px] block font-semibold">WAKTU MASUK</span>
                <span className="font-bold text-gray-900">
                  {formatLocalTime(todayRecord?.clock_in_time)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block font-semibold">WAKTU KELUAR</span>
                <span className="font-bold text-gray-900">
                  {formatLocalTime(todayRecord?.clock_out_time)}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-500 text-[10px] block font-semibold">TEMPOH BERTUGAS</span>
                <span className="font-bold text-amber-700">
                  {Math.floor((todayRecord?.work_duration_minutes || 0) / 60)}j{' '}
                  {(todayRecord?.work_duration_minutes || 0) % 60}m (Sasaran 9j)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-amber-700">
                Status rekod: <strong className="text-amber-800">TIDAK LENGKAP</strong>. Sila hantar
                justifikasi urusan tugas rasmi luar / kecemasan.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/user/justifications')}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
              >
                <span>Hantar Justifikasi Rasmi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. COMPLETED 9-HOUR ATTENDANCE CARD (When Clocked Out Successfully >= 9 Hours) */}
        {hasClockedOut && !isShortfallOnClockOut && (
          <div className="rounded-2xl p-4 sm:p-5 bg-emerald-50 border border-emerald-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">
                  Kehadiran Lengkap (Genap 9 Jam Dipenuhi)
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Masuk: <strong className="text-gray-900">{formatLocalTime(todayRecord?.clock_in_time)}</strong> • Keluar:{' '}
                  <strong className="text-gray-900">{formatLocalTime(todayRecord?.clock_out_time)}</strong> • Tempoh:{' '}
                  <strong className="text-emerald-700">
                    {Math.floor((todayRecord?.work_duration_minutes || 0) / 60)}j{' '}
                    {(todayRecord?.work_duration_minutes || 0) % 60}m
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Statistik Bulanan Section matching exact mockup */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Statistik Bulanan
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {malayMonths[today.getMonth()]} {today.getFullYear()}
          </span>
        </div>

        {/* 4 Cards with top colored accent line */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Kehadiran lengkap (Green Accent) */}
          <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Green Top Line */}
              <div className="h-1 w-10 bg-emerald-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-gray-900">
                {monthlyStats.completedDays}{' '}
                <span className="text-xs font-semibold text-gray-500">Hari</span>
              </p>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-2">
              Kehadiran lengkap
            </p>
          </div>

          {/* Card 2: Jumlah jam bekerja (Blue Accent) */}
          <div className="bg-white border border-blue-100 shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Sky Blue Top Line */}
              <div className="h-1 w-10 bg-sky-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-gray-900">
                {monthlyStats.totalHours}{' '}
                <span className="text-xs font-semibold text-gray-500">Jam</span>
              </p>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-2">
              Jumlah jam bekerja
            </p>
          </div>

          {/* Card 3: Jumlah lewat (Amber Accent) */}
          <div className="bg-white border border-amber-100 shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Amber Top Line */}
              <div className="h-1 w-10 bg-amber-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-gray-900">
                {monthlyStats.lateDays}{' '}
                <span className="text-xs font-semibold text-gray-500">Hari</span>
              </p>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-2">
              Jumlah lewat
            </p>
          </div>

          {/* Card 4: Perlu justifikasi (Rose Accent) */}
          <div className="bg-white border border-rose-100 shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Rose Top Line */}
              <div className="h-1 w-10 bg-rose-500 rounded-full mb-3" />
              <p className="text-xl sm:text-2xl font-black text-gray-900">
                {monthlyStats.needsJustificationCount}{' '}
                <span className="text-xs font-semibold text-gray-500">Rekod</span>
              </p>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-2">
              Perlu justifikasi
            </p>
          </div>
        </div>
      </section>

      {/* Peringatan & Tindakan Pantas Section */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">
          Peringatan & Tindakan Pantas
        </h3>

        <div className="space-y-2.5">
          {/* Item 1: Status Justifikasi Tertunggak */}
          {pendingJustifications.length > 0 ? (
            <button
              onClick={() => onNavigate('/user/justifications')}
              className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                    {pendingJustifications.length} Justifikasi Menunggu Pengesahan
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    Sektor Pengurusan Sekolah sedang menyemak dokumen anda
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Tiada Justifikasi Tertunggak
                </h4>
                <p className="text-[11px] text-gray-500">
                  Semua rekod kehadiran anda dalam keadaan teratur
                </p>
              </div>
            </div>
          )}

          {/* Item 2: Kalendar Kehadiran */}
          <button
            onClick={() => onNavigate('/user/calendar')}
            className="w-full p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  Kalendar Kehadiran PGB
                </h4>
                <p className="text-[11px] text-gray-500">
                  Semak status kehadiran harian, cuti umum & takwim persekolahan
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Item 3: Laporan Bulanan */}
          <button
            onClick={() => onNavigate('/user/monthly-report')}
            className="w-full p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                  Penyata Kehadiran Bulanan
                </h4>
                <p className="text-[11px] text-gray-500">
                  Muat turun slip kehadiran rasmi & semak status perakuan Admin Zon
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      </section>

      {/* Action Modal (Biometric Face Liveness + GPS Geofence) */}
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
