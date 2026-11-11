import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ScanFace,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { WorkSchedule } from '@/types';
import { Button } from '@/components/common/Button';

export const AttendanceRulesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [schedule, setSchedule] = useState<WorkSchedule>(() => dbService.getWorkSchedule());

  const [targetMinutes, setTargetMinutes] = useState(schedule.target_work_minutes);
  const [clockInTime, setClockInTime] = useState(schedule.official_clock_in_time);
  const [tolerance, setTolerance] = useState(schedule.late_tolerance_minutes);
  const [countBreakTime, setCountBreakTime] = useState(schedule.count_break_time_in_hours);
  const [faceCheckRequired, setFaceCheckRequired] = useState(true);
  const [allowOffline, setAllowOffline] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updated = dbService.updateWorkSchedule(
        {
          target_work_minutes: targetMinutes,
          official_clock_in_time: clockInTime,
          late_tolerance_minutes: tolerance,
          count_break_time_in_hours: countBreakTime,
        },
        user
      );
      setSchedule(updated);
      showToast('Peraturan masa dan sasaran waktu bekerja berjaya dikemaskini.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            Peraturan Masa & Jadual Kehadiran Bertugas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi rasmi waktu melapor diri, toleransi kelewatan, sasaran 9 jam bertugas, dan mod pengiraan waktu rehat.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            Simpan Peraturan Kehadiran
          </Button>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Sasaran Jam Bekerja & Waktu Lapor Diri */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Parameter Masa Bertugas Harian
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Waktu Rasmi Melapor Diri (Clock-In)
            </label>
            <input
              type="time"
              disabled={!isSuperAdmin}
              value={clockInTime}
              onChange={(e) => setClockInTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono disabled:bg-slate-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Waktu piawai bagi sesi persekolahan pagi (cth: 07:30 pagi).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Toleransi Kelewatan (Minit)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="60"
                disabled={!isSuperAdmin}
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono disabled:bg-slate-100"
              />
              <span className="text-xs font-semibold text-slate-500 shrink-0">Minit</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Clock-in selepas {clockInTime} + {tolerance} minit akan diklasifikasikan sebagai <strong>LEWAT</strong> secara automatik.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sasaran Tempoh Bertugas Harian (Minit)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="300"
                max="600"
                disabled={!isSuperAdmin}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono disabled:bg-slate-100"
              />
              <span className="text-xs font-semibold text-slate-500 shrink-0">
                Minit ({targetMinutes / 60} Jam)
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Takrifan 9 Jam & Verifikasi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Kaedah Pengiraan 9 Jam Bertugas
          </h3>

          <div className="space-y-3 pt-1">
            <label className="p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="break_mode"
                checked={!countBreakTime}
                onChange={() => setCountBreakTime(false)}
                disabled={!isSuperAdmin}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Mod 1: Masa Berlalu (Elapsed Time)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pengiraan tempoh bertugas dikira secara terus antara waktu clock-in dan waktu clock-out (termasuk waktu rehat dalam perimeter sekolah).
                </p>
              </div>
            </label>

            <label className="p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="break_mode"
                checked={countBreakTime}
                onChange={() => setCountBreakTime(true)}
                disabled={!isSuperAdmin}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Mod 2: Masa Bersih (Net Working Time)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Masa rehat rasmi ditolak daripada jumlah jam bertugas harian, menunggu kelulusan pekeliling rasmi pentadbiran.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kawalan Keselamatan Kehadiran
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Pengecaman Wajah Biometrik</p>
                <p className="text-[11px] text-slate-400">Wajib semasa clock-in dan clock-out</p>
              </div>
              <input
                type="checkbox"
                checked={faceCheckRequired}
                onChange={(e) => setFaceCheckRequired(e.target.checked)}
                disabled={!isSuperAdmin}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Kehadiran Luar Talian (Offline Mode)</p>
                <p className="text-[11px] text-slate-400">Dinyahaktifkan bagi mengelakkan manipulasi masa</p>
              </div>
              <input
                type="checkbox"
                checked={allowOffline}
                onChange={(e) => setAllowOffline(e.target.checked)}
                disabled={!isSuperAdmin}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
