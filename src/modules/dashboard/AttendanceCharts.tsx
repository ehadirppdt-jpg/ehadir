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

interface AttendanceChartsProps {
  zones: Zone[];
}

export const AttendanceCharts: React.FC<AttendanceChartsProps> = ({ zones }) => {
  // Weekly trend data
  const weeklyTrendData = [
    { day: 'Isn (04 Nov)', hadir: 83, lewat: 2, tidakHadir: 0 },
    { day: 'Sel (05 Nov)', hadir: 84, lewat: 1, tidakHadir: 0 },
    { day: 'Rab (06 Nov)', hadir: 82, lewat: 3, tidakHadir: 0 },
    { day: 'Kha (07 Nov)', hadir: 85, lewat: 0, tidakHadir: 0 },
    { day: 'Jum (08 Nov)', hadir: 83, lewat: 2, tidakHadir: 0 },
    { day: 'Isn (11 Nov)', hadir: 84, lewat: 1, tidakHadir: 0 },
  ];

  // Zone statistics data mapped from the 6 real zones
  const zoneStatsData = zones.map((z) => ({
    name: z.code,
    fullName: z.name,
    sekolah: z.total_schools || 0,
    pgb: z.total_pgb || 0,
    peratusHadir: Math.floor(92 + Math.random() * 8), // 92-100%
    color: z.color_hex,
  }));

  // Verification donut data
  const verificationData = [
    { name: 'Disahkan', value: 68, color: '#10B981' },
    { name: 'Dalam Semakan', value: 12, color: '#F59E0B' },
    { name: 'Menunggu Semakan', value: 5, color: '#3B82F6' },
  ];

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
              Analisis rekod kehadiran harian PGB merentasi 85 sekolah
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            Kadar Purata: 98.4%
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis domain={[75, 88]} stroke="#64748b" fontSize={11} />
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
              Bulan 10/2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Penyelesaian verifikasi oleh Admin Zon</p>

          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">80%</span>
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
          <span className="text-xs text-slate-400 font-medium">Bulan Semasa: November 2026</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="fullName" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} unit="%" />
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
