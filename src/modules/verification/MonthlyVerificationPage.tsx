import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  FileCheck2,
  Filter,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { MonthlyAttendanceRecord, MonthlyStatusType } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { exportToExcel } from '@/lib/exportExcel';
import { MonthlyDetailReviewModal } from './MonthlyDetailReviewModal';

export const MonthlyVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Oktober
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRecord, setSelectedRecord] = useState<MonthlyAttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyAttendanceRecord[]>(() =>
    dbService.getMonthlyRecords()
  );

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Role scoping: Admin Zon can verify their assigned records, Monitoring can only view
  const accessibleRecords = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'MONITORING_ADMIN') {
      return monthlyRecords;
    }
    if (user?.role === 'ADMIN_ZON') {
      const allowedZoneIds = new Set(user.assigned_zone_ids || []);
      return monthlyRecords.filter(
        (m) => (m.zone_id && allowedZoneIds.has(m.zone_id)) || m.assigned_approver_id === user.id
      );
    }
    return [];
  }, [monthlyRecords, user]);

  const filteredRecords = useMemo(() => {
    return accessibleRecords.filter((r) => {
      const matchesSearch =
        r.pgb_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.school_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
      const matchesPeriod = r.month === selectedMonth && r.year === selectedYear;

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [accessibleRecords, searchQuery, selectedStatus, selectedMonth, selectedYear]);

  const handleOpenReview = (record: MonthlyAttendanceRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleAction = (action: 'DISAHKAN' | 'DIKEMBALIKAN' | 'DITOLAK', remarks: string) => {
    if (!user || !selectedRecord) return;
    try {
      dbService.verifyMonthlySubmission(selectedRecord.id, action, remarks, user);
      showToast(
        `Laporan kehadiran ${selectedRecord.pgb_name} telah ${action}.`,
        action === 'DISAHKAN' ? 'success' : 'warning'
      );
      setMonthlyRecords(dbService.getMonthlyRecords());
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleExport = () => {
    const data = filteredRecords.map((r) => ({
      Bulan: r.month,
      Tahun: r.year,
      Nama_PGB: r.pgb_name,
      Sekolah: r.school_name,
      Kod_Sekolah: r.school_code,
      Zon: r.zone_name,
      Hari_Bekerja: r.total_working_days,
      Hari_Hadir: r.present_days,
      Hari_Lewat: r.late_days,
      Jumlah_Jam: r.total_hours_rendered,
      Status: r.status,
      Pegawai_Pengesah: r.assigned_approver_name || 'Admin Zon',
    }));
    exportToExcel(data, `Laporan_Pengesahan_Bulanan_${selectedMonth}_${selectedYear}`, 'Pengesahan');
    showToast('Laporan berjaya dieksport ke Excel.', 'success');
  };

  const getStatusBadge = (status: MonthlyStatusType) => {
    switch (status) {
      case 'DISAHKAN':
        return <Badge variant="success" size="sm">Disahkan</Badge>;
      case 'MENUNGGU_SEMAKAN':
        return <Badge variant="primary" size="sm">Menunggu Semakan</Badge>;
      case 'DALAM_SEMAKAN':
        return <Badge variant="warning" size="sm">Dalam Semakan</Badge>;
      case 'DIKEMBALIKAN':
        return <Badge variant="amber" size="sm">Dikembalikan</Badge>;
      case 'DITOLAK':
        return <Badge variant="danger" size="sm">Ditolak</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            Pusat Semakan & Pengesahan Kehadiran Bulanan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Proses pengesahan rasmi bulanan oleh Pegawai Pengesah (Admin Zon) untuk setiap institusi pendidikan.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
        >
          Eksport Status Bulanan
        </Button>
      </div>

      {/* 8-Step Verification Workflow Infographic Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80">
        <p className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wider">
          Aliran Kerja Pengesahan Berkanun (Statutory Verification Workflow)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px]">
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-blue-600 block mb-0.5">1. Auto-Jana</span>
            <span className="text-slate-600">Laporan dijana 1hb</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-blue-600 block mb-0.5">2. Semak Rekod</span>
            <span className="text-slate-600">Audit log harian</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-blue-600 block mb-0.5">3. Kenal Pasti</span>
            <span className="text-slate-600">Kelewatan/Kurang</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-blue-600 block mb-0.5">4. Justifikasi</span>
            <span className="text-slate-600">Dokumen sokongan</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-blue-600 block mb-0.5">5. Agihan Zon</span>
            <span className="text-slate-600">Admin Zon bertugas</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-blue-600 block mb-0.5">6. Penilaian</span>
            <span className="text-slate-600">Semakan terperinci</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-emerald-600 block mb-0.5">7. Keputusan</span>
            <span className="text-slate-600">Sah / Kembalikan</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-blue-100 shadow-xs">
            <span className="font-extrabold text-purple-600 block mb-0.5">8. Pemantauan</span>
            <span className="text-slate-600">Head Admin pantau</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari mengikut nama PGB, sekolah atau kod..."
          className="w-full md:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value={10}>Bulan Oktober 2026</option>
            <option value={11}>Bulan November 2026</option>
            <option value={9}>Bulan September 2026</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="ALL">Semua Status Pengesahan</option>
            <option value="MENUNGGU_SEMAKAN">Menunggu Semakan</option>
            <option value="DALAM_SEMAKAN">Dalam Semakan</option>
            <option value="DISAHKAN">Disahkan</option>
            <option value="DIKEMBALIKAN">Dikembalikan</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <EmptyState
            title="Tiada Laporan Menunggu"
            description="Tiada laporan kehadiran bulanan bagi bulan atau status yang dipilih."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Pengetua / Guru Besar</th>
                  <th className="px-4 py-3.5">Sekolah & Kod</th>
                  <th className="px-4 py-3.5">Zon Pentadbiran</th>
                  <th className="px-4 py-3.5">Statistik Kehadiran</th>
                  <th className="px-4 py-3.5">Pegawai Pengesah</th>
                  <th className="px-4 py-3.5">Status Pengesahan</th>
                  <th className="px-5 py-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{rec.pgb_name}</div>
                      <div className="text-[11px] text-slate-500">
                        Diserahkan: {rec.submitted_at ? new Date(rec.submitted_at).toLocaleDateString('ms-MY') : '-'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{rec.school_name}</div>
                      <div className="text-[11px] font-mono text-blue-700">{rec.school_code}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-700">{rec.zone_name}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">
                        {rec.present_days} / {rec.total_working_days} Hari ({rec.total_hours_rendered} Jam)
                      </div>
                      {rec.late_days > 0 && (
                        <div className="text-[10px] text-amber-600 font-semibold">
                          Lewat: {rec.late_days} hari ({rec.justified_days} Berjustifikasi)
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {rec.assigned_approver_name || 'Admin Zon'}
                    </td>

                    <td className="px-4 py-3.5">{getStatusBadge(rec.status)}</td>

                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant={rec.status === 'DISAHKAN' ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleOpenReview(rec)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        {rec.status === 'DISAHKAN' ? 'Lihat Sijil' : 'Semak & Sahkan'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {user && (
        <MonthlyDetailReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          record={selectedRecord}
          actor={user}
          onAction={handleAction}
        />
      )}
    </div>
  );
};
