import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Power,
  Users,
  School,
  CheckCircle,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { Zone } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { ZoneModal } from './ZoneModal';

export const ZoneManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Load live data
  const [zones, setZones] = useState<Zone[]>(() => dbService.getZones());
  const adminUsers = useMemo(() => dbService.getUsers(), []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const refreshZones = () => {
    setZones(dbService.getZones());
  };

  const filteredZones = useMemo(() => {
    return zones.filter(
      (z) =>
        z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        z.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [zones, searchQuery]);

  const handleCreate = () => {
    setSelectedZone(null);
    setIsModalOpen(true);
  };

  const handleEdit = (zone: Zone) => {
    setSelectedZone(zone);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (zone: Zone) => {
    if (!user) return;
    try {
      const updated = dbService.toggleZoneStatus(zone.id, user);
      showToast(
        `Status ${updated.name} ditukar kepada ${updated.is_active ? 'AKTIF' : 'NYAHAKTIF'}.`,
        'success'
      );
      refreshZones();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleSaveZone = (data: Partial<Zone>) => {
    if (!user) return;
    try {
      if (selectedZone) {
        dbService.updateZone(selectedZone.id, data, user);
        showToast(`Zon ${data.name} berjaya dikemaskini.`, 'success');
      } else {
        dbService.createZone(
          {
            code: data.code || 'Z00',
            name: data.name || '',
            color_hex: data.color_hex || '#2563EB',
            description: data.description,
            is_active: data.is_active ?? true,
            assigned_admin_name: data.assigned_admin_name,
            assigned_admin_id: data.assigned_admin_id,
          },
          user
        );
        showToast(`Zon baharu ${data.name} berjaya dicipta.`, 'success');
      }
      refreshZones();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Pengurusan 6 Zon Pentadbiran PPD Tuaran
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi pecahan 6 zon rasmi, penetapan Pegawai Admin Zon, dan pemantauan jumlah sekolah.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={handleCreate}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Zon Baharu
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari mengikut kod atau nama zon..."
          className="max-w-md w-full"
        />

        <div className="text-xs font-semibold text-slate-500">
          Jumlah Zon: <span className="text-slate-900 font-bold">{filteredZones.length}</span>
        </div>
      </div>

      {/* 6 Visual Zone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            {/* Zone Top Accent Stripe */}
            <div className="h-3.5 w-full" style={{ backgroundColor: zone.color_hex }} />

            <div className="p-6">
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-extrabold px-2.5 py-1 rounded-lg text-white shadow-xs"
                  style={{ backgroundColor: zone.color_hex }}
                >
                  {zone.code}
                </span>

                <div className="flex items-center gap-2">
                  <Badge variant={zone.is_active ? 'success' : 'neutral'} size="sm">
                    {zone.is_active ? 'Zon Aktif' : 'Nyahaktif'}
                  </Badge>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {zone.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                {zone.description || 'Tiada catatan penerangan kawasan.'}
              </p>

              {/* Assigned Admin Zon Card */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Admin Zon Ditugaskan
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {zone.assigned_admin_name || 'Belum Ditetapkan Pegawai'}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                <div className="px-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Sekolah</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {zone.total_schools || 0}
                  </p>
                </div>
                <div className="px-1 border-x border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">PGB</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {zone.total_pgb || 0}
                  </p>
                </div>
                <div className="px-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Kehadiran</p>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">98.5%</p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            {isSuperAdmin && (
              <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(zone)}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    zone.is_active
                      ? 'text-slate-500 hover:text-rose-600'
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {zone.is_active ? 'Nyahaktifkan' : 'Aktifkan'}
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(zone)}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Kemaskini
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      <ZoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        zone={selectedZone}
        adminUsers={adminUsers}
        onSave={handleSaveZone}
      />
    </div>
  );
};
