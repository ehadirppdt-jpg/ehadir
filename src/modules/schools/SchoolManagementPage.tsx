import React, { useState, useMemo } from 'react';
import {
  School as SchoolIcon,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  MapPin,
  ExternalLink,
  Shield,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { School, Zone, SchoolCategoryType } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { exportToExcel } from '@/lib/exportExcel';
import { exportToPdf } from '@/lib/exportPdf';
import { SchoolModal } from './SchoolModal';
import { SchoolImportExportModal } from './SchoolImportExportModal';

interface SchoolManagementPageProps {
  onNavigateToMap?: (schoolId: string) => void;
}

export const SchoolManagementPage: React.FC<SchoolManagementPageProps> = ({
  onNavigateToMap,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const zones = useMemo(() => dbService.getZones(), []);
  const [schools, setSchools] = useState<School[]>(() => dbService.getSchools());

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const refreshSchools = () => {
    setSchools(dbService.getSchools());
  };

  // Filter schools based on Admin Zon assigned zones
  const accessibleSchools = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'MONITORING_ADMIN') {
      return schools;
    }
    if (user?.role === 'ADMIN_ZON') {
      const allowedZoneIds = new Set(user.assigned_zone_ids || []);
      return schools.filter((s) => s.zone_id && allowedZoneIds.has(s.zone_id));
    }
    return [];
  }, [schools, user]);

  // Apply search & dropdown filters
  const filteredSchools = useMemo(() => {
    return accessibleSchools.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.assigned_pgb_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone = selectedZone === 'ALL' || s.zone_id === selectedZone;
      const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;

      return matchesSearch && matchesZone && matchesCategory;
    });
  }, [accessibleSchools, searchQuery, selectedZone, selectedCategory]);

  // Pagination slice
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSchools.slice(start, start + pageSize);
  }, [filteredSchools, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSchools.length / pageSize);

  const handleCreate = () => {
    setEditingSchool(null);
    setIsModalOpen(true);
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  const handleDelete = (school: School) => {
    if (!user) return;
    if (confirm(`Adakah anda pasti ingin memadam rekod sekolah ${school.name}?`)) {
      try {
        const res = dbService.deleteSchool(school.id, user);
        showToast(res.message, res.deactivated ? 'warning' : 'success');
        refreshSchools();
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSave = (data: Partial<School>) => {
    if (!user) return;
    try {
      if (editingSchool) {
        dbService.updateSchool(editingSchool.id, data, user);
        showToast(`Sekolah ${data.name} berjaya dikemaskini.`, 'success');
      } else {
        dbService.createSchool(
          {
            code: data.code || 'XBA4000',
            name: data.name || '',
            category: data.category || 'SK',
            zone_id: data.zone_id,
            zone_name: data.zone_name,
            zone_code: data.zone_code,
            address: data.address,
            postal_code: data.postal_code,
            phone: data.phone,
            email: data.email,
            latitude: data.latitude || 6.134,
            longitude: data.longitude || 116.23,
            geofence_radius_meters: data.geofence_radius_meters || 100,
            status: data.status || 'ACTIVE',
            location_status: data.location_status || 'VERIFIED',
          },
          user
        );
        showToast(`Sekolah ${data.name} berjaya didaftarkan.`, 'success');
      }
      refreshSchools();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredSchools.map((s) => ({
      Kod_Sekolah: s.code,
      Nama_Sekolah: s.name,
      Kategori: s.category,
      Kod_Zon: s.zone_code || 'BELUM_DITETAPKAN',
      Nama_Zon: s.zone_name || 'Tanpa Zon',
      PGB_Ditugaskan: s.assigned_pgb_name || 'Tiada',
      Latitud: s.latitude,
      Longitud: s.longitude,
      Radius_Geofence_Meter: s.geofence_radius_meters,
      Status: s.status,
    }));
    exportToExcel(dataToExport, 'Senarai_Sekolah_PPD_Tuaran', 'Sekolah');
    showToast('Fail Excel berjaya dieksport.', 'success');
  };

  const handleExportPdf = () => {
    const headers = ['Kod', 'Nama Sekolah', 'Kategori', 'Zon Pentadbiran', 'Geofence', 'Status'];
    const rows = filteredSchools.map((s) => [
      s.code,
      s.name,
      s.category,
      s.zone_name || 'Belum Ditetapkan',
      `${s.geofence_radius_meters}m`,
      s.status,
    ]);
    exportToPdf({
      title: 'SENARAI REKOD SEKOLAH PPD TUARAN',
      subtitle: `Jumlah Sekolah: ${filteredSchools.length} buah institusi pendidikan`,
      headers,
      rows,
      fileName: 'Senarai_Sekolah_Tuaran',
    });
    showToast('Fail PDF rasmi berjaya dieksport.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SchoolIcon className="w-6 h-6 text-blue-600" />
            Pengurusan Sekolah PPD Tuaran (~85 Sekolah)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengurusan profil institusi, kod KPM, penetapan satu zon aktif, koordinat GPS dan radius geofence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Eksport Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            icon={<FileText className="w-4 h-4 text-rose-600" />}
          >
            Cetak PDF
          </Button>

          {isSuperAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                icon={<Upload className="w-4 h-4 text-blue-600" />}
              >
                Import CSV / Excel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreate}
                icon={<Plus className="w-4 h-4" />}
              >
                Daftar Sekolah
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Cari mengikut nama sekolah, kod atau nama PGB..."
          className="w-full md:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Zone filter */}
          <select
            value={selectedZone}
            onChange={(e) => {
              setSelectedZone(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="ALL">Semua Zon Pentadbiran</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.code} — {z.name}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="SK">SK (Sekolah Kebangsaan)</option>
            <option value="SMK">SMK (Sekolah Menengah)</option>
            <option value="SJKC">SJKC (Sekolah Cina)</option>
            <option value="SJKT">SJKT (Sekolah Tamil)</option>
            <option value="SABK">SABK (Agama Bantuan)</option>
            <option value="K9">K9 (Komprehensif 9)</option>
          </select>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSchools.length === 0 ? (
          <EmptyState
            title="Tiada Sekolah Dijumpai"
            description="Tiada maklumat sekolah yang sepadan dengan kriteria carian atau penapis zon anda."
            action={
              isSuperAdmin ? (
                <Button variant="primary" size="sm" onClick={handleCreate}>
                  Daftar Sekolah Sekarang
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Kod & Nama Sekolah</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Zon Pentadbiran</th>
                  <th className="px-4 py-3.5">Geofence Kehadiran</th>
                  <th className="px-4 py-3.5">Pengetua / Guru Besar</th>
                  <th className="px-4 py-3.5">Status</th>
                  {isSuperAdmin && <th className="px-5 py-3.5 text-right">Tindakan</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSchools.map((school) => {
                  const zone = zones.find((z) => z.id === school.zone_id);

                  return (
                    <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-xs">{school.name}</div>
                        <div className="text-[11px] font-mono text-blue-700 mt-0.5">{school.code}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="neutral" size="sm">
                          {school.category}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        {zone ? (
                          <span
                            className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: zone.color_hex }}
                          >
                            {zone.code} • {zone.name}
                          </span>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Belum Ditetapkan
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{school.latitude.toFixed(4)}, {school.longitude.toFixed(4)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Radius: <strong>{school.geofence_radius_meters}m</strong>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">
                          {school.assigned_pgb_name || (
                            <span className="text-slate-400 font-normal italic">Belum Ditugaskan</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={school.status === 'ACTIVE' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {school.status === 'ACTIVE' ? 'Aktif' : 'Nyahaktif'}
                        </Badge>
                      </td>

                      {isSuperAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(school)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Kemaskini Maklumat Sekolah"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(school)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Padam atau Nyahaktifkan Sekolah"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSchools.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* School Create/Edit Modal */}
      <SchoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        school={editingSchool}
        zones={zones}
        onSave={handleSave}
      />

      {/* School Bulk Import Modal */}
      {user && (
        <SchoolImportExportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          actor={user}
          onSuccess={refreshSchools}
        />
      )}
    </div>
  );
};
