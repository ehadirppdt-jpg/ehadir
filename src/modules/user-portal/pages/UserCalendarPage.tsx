import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { AttendanceRecord, HolidayRecord } from '@/types';

interface UserCalendarPageProps {
  onNavigate: (path: string) => void;
}

export const UserCalendarPage: React.FC<UserCalendarPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Default to Nov 2026
  const [selectedDayRecord, setSelectedDayRecord] = useState<{
    dateStr: string;
    dayNum: number;
    dayName: string;
    attendance?: AttendanceRecord;
    holiday?: HolidayRecord;
    isWeekend: boolean;
  } | null>(null);

  if (!user) return null;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

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

  const malayDayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

  // All attendance records for this user
  const allUserRecords = dbService.getUserAttendanceRecords(user.id);
  const holidays = dbService.getHolidayCalendar();

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Color legend specification:
  // Green: Kehadiran Lengkap
  // Red: Perlu Justifikasi
  // Grey: Hujung Minggu
  // Blue: Cuti Umum
  // Purple: Cuti Sekolah
  // Yellow: Menunggu Semakan

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar day generator
  const calendarCells = [];
  // Empty cells before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

    // Check holiday
    const holiday = holidays.find((h) => h.holiday_date === dateStr);
    // Check attendance record
    const attendance = allUserRecords.find((r) => r.date === dateStr);

    let statusType: 'GREEN' | 'RED' | 'GREY' | 'BLUE' | 'PURPLE' | 'YELLOW' | 'DEFAULT' = 'DEFAULT';

    if (isWeekend) {
      statusType = 'GREY';
    } else if (holiday) {
      if (holiday.type === 'SCHOOL_TERM') {
        statusType = 'PURPLE';
      } else {
        statusType = 'BLUE';
      }
    } else if (attendance) {
      if (attendance.status === 'LENGKAP') {
        statusType = 'GREEN';
      } else if (attendance.status === 'TIDAK_LENGKAP' || attendance.status === 'PERLU_JUSTIFIKASI' || attendance.status === 'LEWAT') {
        statusType = 'RED';
      } else {
        statusType = 'YELLOW';
      }
    } else {
      // Future or past missing
      const isPast = dayDate < new Date();
      if (isPast) {
        statusType = 'RED'; // Needs justification
      } else {
        statusType = 'DEFAULT';
      }
    }

    calendarCells.push({
      day,
      dateStr,
      dayDate,
      isWeekend,
      holiday,
      attendance,
      statusType,
      dayName: malayDayNames[dayOfWeek],
    });
  }

  const getStatusColorClass = (type: string) => {
    switch (type) {
      case 'GREEN':
        return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400 hover:border-emerald-400';
      case 'RED':
        return 'bg-rose-950/70 border-rose-500/50 text-rose-400 hover:border-rose-400';
      case 'GREY':
        return 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700';
      case 'BLUE':
        return 'bg-sky-950/70 border-sky-500/50 text-sky-400 hover:border-sky-400';
      case 'PURPLE':
        return 'bg-purple-950/70 border-purple-500/50 text-purple-400 hover:border-purple-400';
      case 'YELLOW':
        return 'bg-amber-950/70 border-amber-500/50 text-amber-400 hover:border-amber-400';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Kalendar Kehadiran
          </h2>
          <p className="text-xs text-slate-400">
            Pemantauan harian mengikut piawaian waktu bertugas minimum 9 jam (540 minit).
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-sm self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-white px-3 min-w-[140px] text-center">
            {malayMonths[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Official Color Legend Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Petunjuk Status Kalendar Rasmi:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span className="text-slate-300">Kehadiran Lengkap</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-rose-500" />
            <span className="text-slate-300">Perlu Justifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-amber-500" />
            <span className="text-slate-300">Menunggu Semakan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-sky-500" />
            <span className="text-slate-300">Cuti Umum</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-purple-500" />
            <span className="text-slate-300">Cuti Sekolah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-slate-600" />
            <span className="text-slate-300">Hujung Minggu</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-[#0b1322] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'].map((d, idx) => (
            <div
              key={d}
              className={`text-xs font-bold py-1.5 uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-2xl bg-slate-950/20 border border-transparent"
                />
              );
            }

            const { day, dayName, statusType, attendance, holiday, dateStr, isWeekend } = cell;
            const colorClass = getStatusColorClass(statusType);

            return (
              <button
                key={dateStr}
                onClick={() =>
                  setSelectedDayRecord({
                    dateStr,
                    dayNum: day,
                    dayName,
                    attendance,
                    holiday,
                    isWeekend,
                  })
                }
                className={`aspect-square rounded-2xl border p-1.5 sm:p-2.5 text-left flex flex-col justify-between transition-all active:scale-95 ${colorClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs sm:text-sm font-extrabold">{day}</span>
                  {attendance?.status === 'LENGKAP' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>

                <div className="truncate text-[9px] sm:text-[10px] font-semibold leading-tight">
                  {holiday ? (
                    <span className="truncate block opacity-90">{holiday.name}</span>
                  ) : attendance ? (
                    <span className="truncate block opacity-90">
                      {attendance.clock_in_time} - {attendance.clock_out_time || '...'}
                    </span>
                  ) : isWeekend ? (
                    <span className="text-slate-600 block">Rehat</span>
                  ) : (
                    <span className="opacity-70 block">Tiada rekod</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal / Drawer */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">
                  {selectedDayRecord.dayName}, {selectedDayRecord.dayNum} {malayMonths[currentMonth]} {currentYear}
                </h4>
                <p className="text-xs text-slate-400">Perincian Transaksi Kehadiran Harian</p>
              </div>
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendance Details */}
            {selectedDayRecord.attendance ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status Kehadiran:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        selectedDayRecord.attendance.status === 'LENGKAP'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                          : 'bg-rose-950 text-rose-400 border border-rose-600'
                      }`}
                    >
                      {selectedDayRecord.attendance.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Waktu Masuk:</span>
                    <span className="font-semibold text-white">
                      {selectedDayRecord.attendance.clock_in_time || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Waktu Keluar:</span>
                    <span className="font-semibold text-white">
                      {selectedDayRecord.attendance.clock_out_time || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Jumlah Tempoh Bertugas:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedDayRecord.attendance.work_duration_minutes
                        ? `${Math.floor(selectedDayRecord.attendance.work_duration_minutes / 60)}j ${selectedDayRecord.attendance.work_duration_minutes % 60}m`
                        : '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Kekurangan Jam:</span>
                    <span className="font-semibold text-rose-400">
                      {selectedDayRecord.attendance.shortfall_minutes || 0} minit
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Lokasi:</span>
                    <span className="font-medium text-slate-300 truncate max-w-[180px]">
                      {selectedDayRecord.attendance.location_name}
                    </span>
                  </div>
                </div>

                {/* Justification action if needed */}
                {selectedDayRecord.attendance.status !== 'LENGKAP' && (
                  <button
                    onClick={() => {
                      setSelectedDayRecord(null);
                      onNavigate('/user/justifications');
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Hantar Justifikasi Bagi Tarikh Ini
                  </button>
                )}
              </div>
            ) : selectedDayRecord.holiday ? (
              <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-800/80 text-center space-y-2">
                <Info className="w-8 h-8 text-sky-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">{selectedDayRecord.holiday.name}</h5>
                <p className="text-xs text-slate-300">
                  {selectedDayRecord.holiday.description || 'Hari Kelepasan Rasmi Daerah Tuaran'}
                </p>
              </div>
            ) : selectedDayRecord.isWeekend ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Hujung minggu (Hari kelepasan mingguan)
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-center space-y-3">
                <AlertCircle className="w-7 h-7 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-200">
                  Tiada rekod kehadiran direkodkan bagi hari bekerja ini.
                </p>
                <button
                  onClick={() => {
                    setSelectedDayRecord(null);
                    onNavigate('/user/justifications');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Hantar Justifikasi Ketidakhadiran
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
