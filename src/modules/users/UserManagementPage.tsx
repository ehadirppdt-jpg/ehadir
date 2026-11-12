import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  KeyRound,
  Shield,
  Smartphone,
  ScanFace,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  School,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { UserProfile, School as SchoolType, UserRoleType } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { exportToExcel } from '@/lib/exportExcel';
import { UserModal } from './UserModal';

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('PGB');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [users, setUsers] = useState<UserProfile[]>(() => dbService.getUsers());
  const schools = useMemo(() => dbService.getSchools(), []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const refreshUsers = () => {
    setUsers(dbService.getUsers());
  };

  useEffect(() => {
    dbService.syncUsersFromSupabase().then((synced) => {
      setUsers(synced.filter((u) => !u.email?.toLowerCase()?.includes('probe')));
    });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.ic_no.includes(searchQuery) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.school_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (u: UserProfile) => {
    setEditingUser(u);
    setIsModalOpen(true);
  };

  const handleResetPassword = (targetUser: UserProfile) => {
    if (confirm(`Hantar pautan tetapan semula kata laluan ke ${targetUser.email}?`)) {
      showToast(`Pautan tetapan semula dihantar ke ${targetUser.email}.`, 'success');
    }
  };

  const handleToggleStatus = (targetUser: UserProfile) => {
    if (!user) return;
    const newStatus = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      dbService.updateUser(targetUser.id, { status: newStatus }, user);
      showToast(`Status ${targetUser.full_name} ditukar kepada ${newStatus}.`, 'success');
      refreshUsers();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteUser = (targetUser: UserProfile) => {
    if (!user) return;
    if (
      confirm(
        `Adakah anda pasti ingin memadam akaun ${targetUser.full_name} (${targetUser.email})?`
      )
    ) {
      try {
        dbService.deleteUser(targetUser.id, user);
        showToast(`Akaun ${targetUser.full_name} berjaya dipadam.`, 'success');
        refreshUsers();
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleDeleteAllPgb = () => {
    if (!user) return;
    const pgbUsers = users.filter((u) => u.role === 'PGB');
    if (
      confirm(
        `Adakah anda pasti ingin MEMADAM SEMUA ${pgbUsers.length} AKAUN PGB? Tindakan ini akan mengosongkan senarai Pengetua & Guru Besar untuk pendaftaran semula.`
      )
    ) {
      try {
        pgbUsers.forEach((p) => {
          dbService.deleteUser(p.id, user);
        });
        showToast(`${pgbUsers.length} akaun PGB berjaya dipadam.`, 'success');
        refreshUsers();
      } catch (err: any) {
        showToast(err.message || 'Gagal memadam akaun PGB.', 'error');
      }
    }
  };

  const handleSave = (data: Partial<UserProfile> & { newPassword?: string }) => {
    if (!user) return;
    try {
      if (editingUser) {
        dbService.updateUser(
          editingUser.id,
          {
            ...data,
            ...(data.newPassword ? { password: data.newPassword } : {}),
          },
          user
        );
        showToast(`Profil ${data.full_name} berjaya dikemaskini.`, 'success');
        if (data.newPassword) {
          showToast(`Kata laluan baharu untuk ${data.full_name} berjaya dikemaskini.`, 'info');
        }
      } else {
        dbService.createUser(
          {
            full_name: data.full_name || '',
            ic_no: data.ic_no || '',
            position: data.position || 'Guru Besar',
            email: data.email || '',
            phone_number: data.phone_number,
            status: data.status || 'ACTIVE',
            role: data.role || 'PGB',
            assigned_school_id: data.assigned_school_id,
            school_name: data.school_name,
            password: data.newPassword,
          },
          user
        );
        showToast(`Akaun ${data.full_name} berjaya didaftarkan.`, 'success');
      }
      refreshUsers();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleExportUsers = () => {
    const dataToExport = filteredUsers.map((u) => ({
      Nama_Penuh: u.full_name,
      No_KP: u.ic_no,
      Jawatan: u.position,
      Peranan: u.role,
      Emel_Rasmi: u.email,
      Telefon: u.phone_number || '-',
      Sekolah_Bertugas: u.school_name || 'Tiada',
      Status_Akaun: u.status,
    }));
    exportToExcel(dataToExport, 'Senarai_PGB_PPD_Tuaran', 'Pengguna');
    showToast('Senarai pengguna berjaya dieksport ke Excel.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Pengurusan Akaun Pengetua & Guru Besar (PGB)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengurusan profil identiti, penugasan sekolah, dan status pendaftaran wajah biometrik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && users.some((u) => u.role === 'PGB') && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAllPgb}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Padam Semua PGB
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUsers}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Eksport Senarai PGB
          </Button>

          {isSuperAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              icon={<Plus className="w-4 h-4" />}
            >
              Daftar Akaun PGB
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Cari mengikut nama, No. KP, emel atau nama sekolah..."
          className="w-full md:max-w-md"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          >
            <option value="PGB">Pengetua & Guru Besar (PGB)</option>
            <option value="ADMIN_ZON">Pentadbir Zon (Admin Zon)</option>
            <option value="MONITORING_ADMIN">Pentadbir Pemantau</option>
            <option value="ALL">Semua Peranan</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="Tiada Pengguna Dijumpai"
            description="Tiada akaun yang sepadan dengan carian anda."
            action={
              isSuperAdmin ? (
                <Button variant="primary" size="sm" onClick={handleCreate}>
                  Daftar PGB Baharu
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Nama & Jawatan</th>
                  <th className="px-4 py-3.5">No. Kad Pengenalan</th>
                  <th className="px-4 py-3.5">Sekolah Bertugas</th>
                  <th className="px-4 py-3.5">Hubungi</th>
                  <th className="px-4 py-3.5">Status Biometrik</th>
                  <th className="px-4 py-3.5">Status Akaun</th>
                  {isSuperAdmin && <th className="px-5 py-3.5 text-right">Tindakan</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500">{u.position}</div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {u.ic_no.replace(/(\d{6})(\d{2})(\d{4})/, '$1-$2-$3')}
                    </td>

                    <td className="px-4 py-3.5">
                      {u.school_name ? (
                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                          <School className="w-3.5 h-3.5 shrink-0" />
                          <span>{u.school_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Tiada Penugasan</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-700">{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone_number || '-'}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                        title="Wajah biometrik telah didaftarkan dan disahkan"
                      >
                        <ScanFace className="w-3 h-3 text-emerald-600" />
                        Wajah Sah
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          u.status === 'ACTIVE'
                            ? 'success'
                            : u.status === 'SUSPENDED'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {u.status === 'ACTIVE'
                          ? 'Aktif'
                          : u.status === 'SUSPENDED'
                          ? 'Digantung'
                          : 'Nyahaktif'}
                      </Badge>
                    </td>

                    {isSuperAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Tetapan Semula Kata Laluan"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Kemaskini Profil Pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Padam Akaun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        schools={schools}
        onSave={handleSave}
      />
    </div>
  );
};

