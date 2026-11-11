import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  Layers,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { UserProfile, Zone } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

export const AdminManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>(() => dbService.getUsers());
  const zones = useMemo(() => dbService.getZones(), []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<'ADMIN_ZON' | 'MONITORING_ADMIN'>('ADMIN_ZON');
  const [assignedZoneIds, setAssignedZoneIds] = useState<string[]>([]);

  const adminUsers = useMemo(() => {
    return users.filter((u) => u.role !== 'PGB');
  }, [users]);

  useEffect(() => {
    dbService.syncUsersFromSupabase().then((synced) => {
      setUsers(synced);
    });
  }, []);

  const handleOpenModal = (admin?: UserProfile) => {
    if (admin) {
      setSelectedAdmin(admin);
      setFullName(admin.full_name);
      setEmail(admin.email);
      setPosition(admin.position);
      setRole((admin.role as any) || 'ADMIN_ZON');
      setAssignedZoneIds(admin.assigned_zone_ids || []);
    } else {
      setSelectedAdmin(null);
      setFullName('');
      setEmail('');
      setPosition('Penolong Pegawai PPD Tuaran');
      setRole('ADMIN_ZON');
      setAssignedZoneIds([]);
    }
    setIsModalOpen(true);
  };

  const handleZoneCheckbox = (zoneId: string) => {
    setAssignedZoneIds((prev) =>
      prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (selectedAdmin) {
        dbService.updateUser(
          selectedAdmin.id,
          {
            full_name: fullName.trim().toUpperCase(),
            position: position.trim(),
            role,
            assigned_zone_ids: role === 'ADMIN_ZON' ? assignedZoneIds : [],
          },
          user
        );
        showToast(`Maklumat pentadbir ${fullName} berjaya dikemaskini.`, 'success');
      } else {
        dbService.createUser(
          {
            full_name: fullName.trim().toUpperCase(),
            ic_no: '80010112' + Math.floor(1000 + Math.random() * 9000),
            position: position.trim(),
            email: email.trim().toLowerCase(),
            role,
            status: 'ACTIVE',
            assigned_zone_ids: role === 'ADMIN_ZON' ? assignedZoneIds : [],
          },
          user
        );
        showToast(`Pentadbir baharu ${fullName} berjaya didaftarkan.`, 'success');
      }
      setUsers(dbService.getUsers());
      setIsModalOpen(false);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteAdmin = (targetAdmin: UserProfile) => {
    if (!user) return;
    if (targetAdmin.id === user.id) {
      showToast('Akaun anda sendiri tidak boleh dipadam.', 'error');
      return;
    }
    if (
      confirm(
        `Adakah anda pasti ingin memadam pentadbir ${targetAdmin.full_name} (${targetAdmin.email})?`
      )
    ) {
      try {
        dbService.deleteUser(targetAdmin.id, user);
        showToast(`Pentadbir ${targetAdmin.full_name} berjaya dipadam.`, 'success');
        setUsers(dbService.getUsers());
      } catch (err: any) {
        showToast(err.message || 'Gagal memadam pentadbir.', 'error');
      }
    }
  };

  const handleDeleteAllOtherAdmins = () => {
    if (!user) return;
    if (
      confirm(
        'Adakah anda pasti ingin MEMADAM SEMUA PENTADBIR selain akaun Super Admin anda? Tindakan ini akan memadam semua Admin Zon dan Pemantau.'
      )
    ) {
      try {
        const res = dbService.deleteAllNonSuperAdmins(user);
        showToast(res.message, 'success');
        setUsers(dbService.getUsers());
      } catch (err: any) {
        showToast(err.message || 'Gagal memadam pentadbir.', 'error');
      }
    }
  };

  const hasOtherAdmins = adminUsers.some((a) => a.role !== 'SUPER_ADMIN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            Pengurusan Pentadbir Zon & Sistem (Admin RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penetapan skop kuasa, penugasan Admin Zon kepada zon tertentu, dan kawalan pentadbir pemantau.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasOtherAdmins && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAllOtherAdmins}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Padam Semua Pentadbir Lain
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Daftar Pentadbir Baharu
          </Button>
        </div>
      </div>

      {/* Admin Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminUsers.map((admin) => {
          const assignedZones = zones.filter((z) => (admin.assigned_zone_ids || []).includes(z.id));

          return (
            <div
              key={admin.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={
                      admin.role === 'SUPER_ADMIN'
                        ? 'primary'
                        : admin.role === 'ADMIN_ZON'
                        ? 'purple'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {admin.role === 'SUPER_ADMIN'
                      ? 'Ketua Pentadbir'
                      : admin.role === 'ADMIN_ZON'
                      ? 'Admin Zon'
                      : 'Monitoring Admin'}
                  </Badge>

                  <Badge variant={admin.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                    {admin.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900">{admin.full_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{admin.position}</p>
                <p className="text-xs font-mono text-blue-600 mt-1">{admin.email}</p>

                {/* Assigned Zones */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-500" />
                    Skop Zon Diberi Kuasa:
                  </p>

                  {admin.role === 'SUPER_ADMIN' ? (
                    <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                      Akses Penuh Semua 6 Zon
                    </span>
                  ) : admin.role === 'MONITORING_ADMIN' ? (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                      Semua Zon (Lihat Sahaja / Read-Only)
                    </span>
                  ) : assignedZones.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedZones.map((z) => (
                        <span
                          key={z.id}
                          className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: z.color_hex }}
                        >
                          {z.code} • {z.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-rose-600 italic">Belum Ada Zon Ditugaskan</span>
                  )}
                </div>
              </div>

              {admin.role !== 'SUPER_ADMIN' && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(admin)}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Ubah Zon / Skop
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteAdmin(admin)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Padam
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAdmin ? `Ubah Kuasa ${selectedAdmin.full_name}` : 'Daftar Pentadbir Baharu'}
        subtitle="Tetapkan peranan pentadbiran dan zon sekolah yang dibenarkan untuk diuruskan"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Penuh</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emel Rasmi PPD</label>
            <input
              type="email"
              required
              disabled={!!selectedAdmin}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jawatan di PPD</label>
            <input
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Peranan Akses</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="ADMIN_ZON">Admin Zon (Mengurus zon tertentu)</option>
              <option value="MONITORING_ADMIN">Monitoring Admin (Hanya memantau)</option>
            </select>
          </div>

          {role === 'ADMIN_ZON' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Zon Di Bawah Kawalan Pegawai Ini:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {zones.map((z) => (
                  <label
                    key={z.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={assignedZoneIds.includes(z.id)}
                      onChange={() => handleZoneCheckbox(z.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold" style={{ color: z.color_hex }}>
                      {z.code}
                    </span>
                    <span className="text-slate-700 truncate">{z.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Maklumat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

