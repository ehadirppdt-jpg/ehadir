import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  History,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { School, UserProfile, MonthlyApproverAssignment, Zone } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { exportToExcel } from '@/lib/exportExcel';
import { exportToPdf } from '@/lib/exportPdf';
import { AssignApproverModal } from './AssignApproverModal';

export const ApproverAssignmentPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState<number>(11); // November
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSchool, setTargetSchool] = useState<School | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<MonthlyApproverAssignment | null>(null);

  const schools = useMemo(() => dbService.getSchools(), []);
  const zones = useMemo(() => dbService.getZones(), []);
  const adminUsers = useMemo(() => dbService.getUsers(), []);

  const [assignments, setAssignments] = useState<MonthlyApproverAssignment[]>(() =>
    dbService.getApproverAssignments(selectedMonth, selectedYear)
  );

  const refreshAssignments = () => {
    setAssignments(dbService.getApproverAssignments(selectedMonth, selectedYear));
  };

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  // Map each school to its active approver assignment for the selected month/year
  const schoolRows = useMemo(() => {
    return schools.map((school) => {
      const activeAsg = assignments.find(
        (a) => a.school_id === school.id && a.is_primary && a.status === 'ACTIVE'
      );
      const zone = zones.find((z) => z.id === school.zone_id);

      return {
        school,
        zone,
        assignment: activeAsg || null,
        isAssigned: !!activeAsg,
      };
    });
  }, [schools, assignments, zones]);

  // Filter school rows
  const filteredSchoolRows = useMemo(() => {
    return schoolRows.filter((row) => {
      const matchesSearch =
        row.school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.school.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.assignment?.assigned_admin_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone = selectedZone === 'ALL' || row.school.zone_id === selectedZone;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ASSIGNED' && row.isAssigned) ||
        (statusFilter === 'UNASSIGNED' && !row.isAssigned);

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [schoolRows, searchQuery, selectedZone, statusFilter]);

  const unassignedCount = schoolRows.filter((r) => !r.isAssigned).length;

  const handleOpenAssign = (school: School, existing?: MonthlyApproverAssignment | null) => {
    setTargetSchool(school);
    setCurrentAssignment(existing || null);
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (adminId: string, notes?: string) => {
    if (!user || !targetSchool) return;

    try {
      dbService.assignMonthlyApprover(
        {
          month: selectedMonth,
          year: selectedYear,
          school_id: targetSchool.id,
          admin_id: adminId,
          notes,
        },
        user
      );

      showToast(
        `Penetapan pengesah bagi ${targetSchool.name} berjaya disimpan bagi Bulan ${selectedMonth}/${selectedYear}.`,
        'success'
      );
      refreshAssignments();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleExportExcel = () => {
    const data = filteredSchoolRows.map((r) => ({
      Bulan: selectedMonth,
      Tahun: selectedYear,
      Kod_Sekolah: r.school.code,
      Nama_Sekolah: r.school.name,
      Zon: r.zone?.name || 'Belum Ditetapkan',
      Pegawai_Pengesah_Bulanan: r.assignment?.assigned_admin_name || 'BELUM DITETAPKAN',
      Emel_Pengesah: r.assignment?.assigned_admin_email || '-',
      Status_Penetapan: r.isAssigned ? 'Ditetapkan' : 'Belum Ditetapkan',
    }));
    exportToExcel(
      data,
      `Penetapan_Pegawai_Pengesah_${selectedMonth}_${selectedYear}`,
      'PenetapanPengesah'
    );
    showToast('Senarai penetapan berjaya dieksport ke Excel.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Penetapan Pegawai Pengesah Bulanan (Monthly Approver)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ketua Pentadbir menetapkan Pegawai Admin Zon bagi setiap sekolah untuk mengesahkan kehadiran PGB setiap bulan.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
        >
          Eksport Penetapan ({monthNames[selectedMonth - 1]})
        </Button>
      </div>

      {/* Unassigned Warning Banner */}
      {unassignedCount > 0 ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">
                Perhatian: Terdapat {unassignedCount} Buah Sekolah Belum Mempunyai Pegawai Pengesah!
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Bagi Bulan {monthNames[selectedMonth - 1]} {selectedYear}, sila tetapkan Pegawai Admin Zon supaya verifikasi bulanan dapat diproses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('UNASSIGNED')}
            className="text-xs font-bold text-amber-800 underline shrink-0 hover:text-amber-950"
          >
            Tapis Sekolah Belum Ditetapkan →
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold">
            Semua sekolah telah mempunyai Pegawai Pengesah bagi Bulan {monthNames[selectedMonth - 1]} {selectedYear}!
          </p>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari sekolah atau pegawai pengesah..."
          className="w-full md:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => {
              const m = parseInt(e.target.value, 10);
              setSelectedMonth(m);
              setAssignments(dbService.getApproverAssignments(m, selectedYear));
            }}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            {monthNames.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                Bulan {name}
              </option>
            ))}
          </select>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => {
              const y = parseInt(e.target.value, 10);
              setSelectedYear(y);
              setAssignments(dbService.getApproverAssignments(selectedMonth, y));
            }}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value={2026}>Tahun 2026</option>
            <option value={2025}>Tahun 2025</option>
          </select>

          {/* Zone filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="ALL">Semua 6 Zon</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.code} — {z.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="ALL">Semua Status</option>
            <option value="ASSIGNED">Telah Ditetapkan</option>
            <option value="UNASSIGNED">Belum Ditetapkan</option>
          </select>
        </div>
      </div>

      {/* Assignment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSchoolRows.length === 0 ? (
          <EmptyState
            title="Tiada Sekolah Dijumpai"
            description="Tiada rekod sekolah yang memenuhi kriteria penapis."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Sekolah (PPD Tuaran)</th>
                  <th className="px-4 py-3.5">Zon Pentadbiran</th>
                  <th className="px-4 py-3.5">Bulan & Tahun</th>
                  <th className="px-4 py-3.5">Pegawai Pengesah Bulanan (Admin Zon)</th>
                  <th className="px-4 py-3.5">Status Penetapan</th>
                  <th className="px-5 py-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchoolRows.map((row) => (
                  <tr key={row.school.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{row.school.name}</div>
                      <div className="text-[11px] font-mono text-blue-700">{row.school.code}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      {row.zone ? (
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: row.zone.color_hex }}
                        >
                          {row.zone.code} • {row.zone.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Belum Ditetapkan Zon</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {monthNames[selectedMonth - 1]} {selectedYear}
                    </td>

                    <td className="px-4 py-3.5">
                      {row.assignment ? (
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            {row.assignment.assigned_admin_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {row.assignment.assigned_admin_email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-rose-600 font-semibold italic flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Belum Ditetapkan Pengesah
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant={row.isAssigned ? 'success' : 'danger'} size="sm">
                        {row.isAssigned ? 'Aktif' : 'Perlu Tindakan'}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant={row.isAssigned ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleOpenAssign(row.school, row.assignment)}
                        icon={row.isAssigned ? <Edit2 className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      >
                        {row.isAssigned ? 'Pinda Pengesah' : 'Tetapkan Pengesah'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AssignApproverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        school={targetSchool}
        month={selectedMonth}
        year={selectedYear}
        adminUsers={adminUsers}
        currentAssignment={currentAssignment}
        onSave={handleSaveAssignment}
      />
    </div>
  );
};
