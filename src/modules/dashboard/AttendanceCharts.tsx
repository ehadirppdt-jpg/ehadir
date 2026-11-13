import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Zone } from '@/types';
import { dbService } from '@/lib/db';
import { getLocalDateStr } from '@/lib/dateUtils';

interface AttendanceChartsProps {
  zones: Zone[];
}

export const AttendanceCharts: React.FC<AttendanceChartsProps> = ({ zones }) => {
  const schools = dbService.getSchools();
  const monthlyRecords = dbService.getMonthlyRecords();
  const attendanceRecords = dbService.getAttendanceRecords();
  const totalSchools = schools.length;

  // 1. Weekly trend data generated from actual records
  const getPastWeekdays = () => {
    const days: { day: string; dateStr: string }[] = [];
    const dayNames = ['Aha', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
    const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthName = monthNames[d.getMonth()];
      const dateStr = getLocalDateStr(d);
      days.push({
        day: `${dayName} (${dayNum} ${monthName})`,
        dateStr,
      });
    }
    return days;
  };

  const weekdays = getPastWeekdays();
  const weeklyTrendData = weekdays.map((wd) => {
    const dayRecords = attendanceRecords.filter((r) => r.date === wd.dateStr);
    const hadir = dayRecords.filter((r) => !!r.clock_in_time && r.status !== 'LEWAT').length;
    const lewat = dayRecords.filter((r) => r.status === 'LEWAT').length;
    const tidakHadir = dayRecords.filter((r) => !r.clock_in_time).length;
    return {
      day: wd.day,
      hadir,
      lewat,
      tidakHadir,
    };
  });

  const totalHadirWeekly = weeklyTrendData.reduce((acc, cur) => acc + cur.hadir + cur.lewat, 0);
  const averageRate = totalHadirWeekly > 0 && totalSchools > 0
    ? Math.min(100, Math.round((totalHadirWeekly / (weeklyTrendData.length * totalSchools)) * 100))
    : 0;

  // 2. Verification donut data calculated from monthly records
  const disahkanCount = monthlyRecords.filter((m) => m.status === 'DISAHKAN').length;
  const dalamSemakanCount = monthlyRecords.filter(
    (m) => m.status === 'DALAM_SEMAKAN' || m.status === 'DIKEMBALIKAN'
  ).length;
  const menungguSemakanCount = monthlyRecords.filter(
    (m) => m.status === 'MENUNGGU_SEMAKAN' || m.status === 'DIJANA' || m.status === 'BELUM_DIJANA'
  ).length;

  const totalVerifications = disahkanCount + dalamSemakanCount + menungguSemakanCount;
  const verifiedPercentage = totalVerifications > 0
    ? Math.round((disahkanCount / totalVerifications) * 100)
    : 0;

  const verificationData = [
    { name: 'Disahkan', value: disahkanCount, color: '#10B981' },
    { name: 'Dalam Semakan', value: dalamSemakanCount, color: '#F59E0B' },
    { name: 'Menunggu Semakan', value: menungguSemakanCount, color: '#3B82F6' },
  ];

  const pieDisplayData = totalVerifications > 0
    ? verificationData
    : [{ name: 'Tiada Rekod', value: 1, color: '#E2E8F0' }];

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });

  // 3. Zone statistics mapped dynamically
  const todayStr = getLocalDateStr();
  const zoneStatsData = zones.map((z) => {
    const zoneSchools = schools.filter((s) => s.zone_id === z.id);
    const zoneSchoolIds = new Set(zoneSchools.map((s) => s.id));
    const todayZoneRecords = attendanceRecords.filter(
      (r) => r.date === todayStr && zoneSchoolIds.has(r.school_id)
    );
    const presentInZone = todayZoneRecords.filter((r) => !!r.clock_in_time).length;
    const peratusHadir = zoneSchools.length > 0
      ? Math.round((presentInZone / zoneSchools.length) * 100)
      : 0;

    return {
      name: z.code,
      fullName: z.name,
      sekolah: zoneSchools.length,
      pgb: z.total_pgb || zoneSchools.length,
      peratusHadir,
      color: z.color_hex,
    };
  });

  const maxWeeklyY = totalSchools > 0 ? Math.max(totalSchools, 10) : 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Trend Kehadiran Mingguan (2 Columns) */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Trend Kehadiran Mingguan (PPD Tuaran)
            </h3>
            <p className="text-xs text-slate-500">
              Analisis rekod kehadiran harian PGB merentasi {totalSchools} sekolah
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            Kadar Purata: {averageRate}%
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, maxWeeklyY]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="hadir"
                name="Hadir Tepat Masa"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563EB' }}
              />
              <Line
                type="monotone"
                dataKey="lewat"
                name="Lewat Hadir"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 3, fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Status Pengesahan Bulanan (Donut) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Kemajuan Pengesahan Bulanan
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Bulan {currentMonth}/{currentYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Penyelesaian verifikasi oleh Admin Zon</p>

          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDisplayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={totalVerifications > 0 ? 4 : 0}
                  dataKey="value"
                >
                  {pieDisplayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {totalVerifications > 0 && <Tooltip />}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">{verifiedPercentage}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Disahkan</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          {verificationData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}</span>
              </div>
              <span className="font-bold text-slate-900">{item.value} Sekolah</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Peratusan Kehadiran Mengikut 6 Zon (Full Width Bar Chart) */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Peratus Kehadiran Mengikut 6 Zon Pentadbiran
            </h3>
            <p className="text-xs text-slate-500">
              Z01 Tenghilan • Z02 Mengkabong • Z03 Sulaman • Z04 Kiulu • Z05 Nabalu • Z06 Tamparuli
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Bulan Semasa: {currentMonthName}</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="fullName" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Kadar Kehadiran']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="peratusHadir" name="Peratus Kehadiran (%)" radius={[6, 6, 0, 0]}>
                {zoneStatsData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

