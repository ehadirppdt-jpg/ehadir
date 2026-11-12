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
  const [currentDate, setCurrentDate] = useState(() => new Date());
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
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
  ];

  const malayDayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

  const allUserRecords = dbService.getUserAttendanceRecords(user.id);
  const holidays = dbService.getHolidayCalendar();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const holiday = holidays.find((h) => h.holiday_date === dateStr);
    const attendance = allUserRecords.find((r) => r.date === dateStr);

    let statusType: 'GREEN' | 'RED' | 'GREY' | 'BLUE' | 'PURPLE' | 'YELLOW' | 'DEFAULT' = 'DEFAULT';

    if (isWeekend) {
      statusType = 'GREY';
    } else if (holiday) {
      statusType = holiday.type === 'SCHOOL_TERM' ? 'PURPLE' : 'BLUE';
    } else if (attendance) {
      if (attendance.status === 'LENGKAP') {
        statusType = 'GREEN';
      } else if (
        attendance.status === 'TIDAK_LENGKAP' ||
        attendance.status === 'PERLU_JUSTIFIKASI' ||
        attendance.status === 'LEWAT'
      ) {
        statusType = 'RED';
      } else {
        statusType = 'YELLOW';
      }
    } else {
      const isPast = dayDate < new Date();
      statusType = isPast ? 'RED' : 'DEFAULT';
    }

    calendarCells.push({ day, dateStr, dayDate, isWeekend, holiday, attendance, statusType, dayName: malayDayNames[dayOfWeek] });
  }

  const getStatusColorClass = (type: string) => {
    switch (type) {
      case 'GREEN':
        return 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:border-emerald-500 hover:shadow-sm';
      case 'RED':
        return 'bg-rose-50 border-rose-300 text-rose-700 hover:border-rose-500 hover:shadow-sm';
      case 'GREY':
        return 'bg-gray-100 border-gray-200 text-gray-400 hover:border-gray-300';
      case 'BLUE':
        return 'bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-500 hover:shadow-sm';
      case 'PURPLE':
        return 'bg-purple-50 border-purple-300 text-purple-700 hover:border-purple-500 hover:shadow-sm';
      case 'YELLOW':
        return 'bg-amber-50 border-amber-300 text-amber-700 hover:border-amber-500 hover:shadow-sm';
      default:
        return 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:shadow-sm';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Kalendar Kehadiran
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pemantauan harian mengikut piawaian waktu bertugas minimum 9 jam (540 minit).
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-900 px-3 min-w-[140px] text-center">
            {malayMonths[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Official Color Legend Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-sm">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
          Petunjuk Status Kalendar Rasmi:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
            <span className="text-gray-700">Kehadiran Lengkap</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-rose-500 shrink-0" />
            <span className="text-gray-700">Perlu Justifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
            <span className="text-gray-700">Menunggu Semakan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-blue-500 shrink-0" />
            <span className="text-gray-700">Cuti Umum</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-purple-500 shrink-0" />
            <span className="text-gray-700">Cuti Sekolah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-gray-400 shrink-0" />
            <span className="text-gray-700">Hujung Minggu</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'].map((d, idx) => (
            <div
              key={d}
              className={`text-xs font-bold py-1.5 uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-gray-400' : 'text-gray-600'
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
                  className="aspect-square rounded-2xl bg-gray-50 border border-transparent"
                />
              );
            }

            const { day, dayName, statusType, attendance, holiday, dateStr, isWeekend } = cell;
            const colorClass = getStatusColorClass(statusType);

            return (
              <button
                key={dateStr}
                onClick={() =>
                  setSelectedDayRecord({ dateStr, dayNum: day, dayName, attendance, holiday, isWeekend })
                }
                className={`aspect-square rounded-2xl border p-1.5 sm:p-2.5 text-left flex flex-col justify-between transition-all active:scale-95 ${colorClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs sm:text-sm font-extrabold">{day}</span>
                  {attendance?.status === 'LENGKAP' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                    <span className="text-gray-400 block">Rehat</span>
                  ) : (
                    <span className="opacity-70 block">Tiada rekod</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  {selectedDayRecord.dayName}, {selectedDayRecord.dayNum} {malayMonths[currentMonth]} {currentYear}
                </h4>
                <p className="text-xs text-gray-500">Perincian Transaksi Kehadiran Harian</p>
              </div>
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendance Details */}
            {selectedDayRecord.attendance ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Status Kehadiran:</span>
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                        selectedDayRecord.attendance.status === 'LENGKAP'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {selectedDayRecord.attendance.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Waktu Masuk:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDayRecord.attendance.clock_in_time || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Waktu Keluar:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDayRecord.attendance.clock_out_time || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Jumlah Tempoh Bertugas:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedDayRecord.attendance.work_duration_minutes
                        ? `${Math.floor(selectedDayRecord.attendance.work_duration_minutes / 60)}j ${selectedDayRecord.attendance.work_duration_minutes % 60}m`
                        : '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Kekurangan Jam:</span>
                    <span className="font-semibold text-rose-600">
                      {selectedDayRecord.attendance.shortfall_minutes || 0} minit
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                    <span className="text-gray-500 font-medium">Lokasi:</span>
                    <span className="font-medium text-gray-700 truncate max-w-[180px]">
                      {selectedDayRecord.attendance.location_name}
                    </span>
                  </div>
                </div>

                {selectedDayRecord.attendance.status !== 'LENGKAP' && (
                  <button
                    onClick={() => {
                      setSelectedDayRecord(null);
                      onNavigate('/user/justifications');
                    }}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    Hantar Justifikasi Bagi Tarikh Ini
                  </button>
                )}
              </div>
            ) : selectedDayRecord.holiday ? (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2">
                <Info className="w-8 h-8 text-blue-600 mx-auto" />
                <h5 className="text-sm font-bold text-gray-900">{selectedDayRecord.holiday.name}</h5>
                <p className="text-xs text-gray-600">
                  {selectedDayRecord.holiday.description || 'Hari Kelepasan Rasmi Daerah Tuaran'}
                </p>
              </div>
            ) : selectedDayRecord.isWeekend ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
                Hujung minggu (Hari kelepasan mingguan)
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                <AlertCircle className="w-7 h-7 text-rose-500 mx-auto" />
                <p className="text-xs text-rose-700">
                  Tiada rekod kehadiran direkodkan bagi hari bekerja ini.
                </p>
                <button
                  onClick={() => {
                    setSelectedDayRecord(null);
                    onNavigate('/user/justifications');
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors active:scale-95"
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
