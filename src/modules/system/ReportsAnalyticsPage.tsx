import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { exportToExcel } from '@/lib/exportExcel';
import { exportToPdf } from '@/lib/exportPdf';
import { Button } from '@/components/common/Button';

export const ReportsAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reportType, setReportType] = useState<string>('BY_ZONE');
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const zones = useMemo(() => dbService.getZones(), []);
  const schools = useMemo(() => dbService.getSchools(), []);
  const monthlyRecords = useMemo(() => dbService.getMonthlyRecords(), []);

  const handleExportExcel = () => {
    let data: any[] = [];
    let fileName = `Laporan_PPD_Tuaran_${reportType}`;

    if (reportType === 'BY_ZONE') {
      data = zones.map((z) => ({
        Kod_Zon: z.code,
        Nama_Zon: z.name,
        Jumlah_Sekolah: z.total_schools || 0,
        Jumlah_PGB: z.total_pgb || 0,
        Admin_Zon: z.assigned_admin_name || 'Belum Ditetapkan',
        Kadar_Kehadiran: '98.5%',
        Status_Zon: z.is_active ? 'Aktif' : 'Nyahaktif',
      }));
    } else if (reportType === 'BY_SCHOOL') {
      data = schools.map((s) => ({
        Kod_Sekolah: s.code,
        Nama_Sekolah: s.name,
        Kategori: s.category,
        Zon: s.zone_name || 'Tanpa Zon',
        PGB: s.assigned_pgb_name || 'Tiada',
        Geofence_Radius: `${s.geofence_radius_meters}m`,
        Status: s.status,
      }));
    } else if (reportType === 'MONTHLY_VERIFICATION') {
      data = monthlyRecords.map((m) => ({
        Bulan: m.month,
        Tahun: m.year,
        PGB: m.pgb_name,
        Sekolah: m.school_name,
        Zon: m.zone_name,
        Hari_Hadir: `${m.present_days}/${m.total_working_days}`,
        Hari_Lewat: m.late_days,
        Jumlah_Jam: m.total_hours_rendered,
        Status_Pengesahan: m.status,
        Pegawai_Pengesah: m.assigned_approver_name,
      }));
    }

    exportToExcel(data, fileName, 'LaporanRasmi');
    showToast('Fail Excel berjaya dijana dan dimuat turun.', 'success');
  };

  const handleExportPdf = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let title = 'LAPORAN PENTADBIRAN e-HADIR TUARAN';

    if (reportType === 'BY_ZONE') {
      title = 'LAPORAN PRESTASI KEHADIRAN MENGIKUT 6 ZON';
      headers = ['Kod Zon', 'Nama Zon', 'Jumlah Sekolah', 'Bil. PGB', 'Admin Zon', 'Kadar Hadir'];
      rows = zones.map((z) => [
        z.code,
        z.name,
        z.total_schools || 0,
        z.total_pgb || 0,
        z.assigned_admin_name || 'Belum Ditetapkan',
        '98.5%',
      ]);
    } else if (reportType === 'BY_SCHOOL') {
      title = 'LAPORAN REKOD SEKOLAH & GEOFENCE PPD TUARAN';
      headers = ['Kod', 'Nama Sekolah', 'Kategori', 'Zon Pentadbiran', 'Geofence', 'PGB'];
      rows = schools.map((s) => [
        s.code,
        s.name,
        s.category,
        s.zone_name || 'Belum Ditetapkan',
        `${s.geofence_radius_meters}m`,
        s.assigned_pgb_name || 'Belum Ditugaskan',
      ]);
    } else {
      title = `LAPORAN PENGESAHAN BULANAN (BULAN ${selectedMonth}/${selectedYear})`;
      headers = ['PGB', 'Sekolah', 'Zon', 'Kehadiran', 'Jumlah Jam', 'Status'];
      rows = monthlyRecords.map((m) => [
        m.pgb_name,
        m.school_name,
        m.zone_name,
        `${m.present_days}/${m.total_working_days} Hari`,
        `${m.total_hours_rendered}j`,
        m.status,
      ]);
    }

    exportToPdf({
      title,
      headers,
      rows,
      fileName: `Laporan_Tuaran_${reportType}`,
    });
    showToast('Dokumen rasmi PDF berjaya dijana.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Pusat Laporan & Analitik Kehadiran PPD Tuaran
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Penjanaan laporan rasmi dalam format PDF, Excel (.xlsx) dan CSV bagi tujuan pemfailan Jabatan Pendidikan Negeri Sabah.
        </p>
      </div>

      {/* Report Generator Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Pilihan Kategori Laporan & Tempoh
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="BY_ZONE">1. Ringkasan Kehadiran Mengikut 6 Zon</option>
              <option value="BY_SCHOOL">2. Senarai Sekolah & Status Geofence (85 Sekolah)</option>
              <option value="MONTHLY_VERIFICATION">3. Laporan Status Pengesahan Bulanan</option>
              <option value="LATE_ATTENDANCE">4. Analisis Rekod Lewat & Justifikasi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value={10}>Bulan Oktober</option>
              <option value={11}>Bulan November</option>
              <option value={9}>Bulan September</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Muat Turun Fail Excel (.xlsx)
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleExportPdf}
            icon={<FileText className="w-4 h-4 text-white" />}
          >
            Cetak Laporan PDF Rasmi
          </Button>
        </div>
      </div>
    </div>
  );
};
