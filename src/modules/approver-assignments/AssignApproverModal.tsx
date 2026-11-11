import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { School, UserProfile, MonthlyApproverAssignment } from '@/types';

interface AssignApproverModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  month: number;
  year: number;
  adminUsers: UserProfile[];
  currentAssignment?: MonthlyApproverAssignment | null;
  onSave: (adminId: string, notes?: string) => void;
}

export const AssignApproverModal: React.FC<AssignApproverModalProps> = ({
  isOpen,
  onClose,
  school,
  month,
  year,
  adminUsers,
  currentAssignment,
  onSave,
}) => {
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentAssignment) {
      setSelectedAdminId(currentAssignment.assigned_admin_id);
      setNotes(currentAssignment.notes || '');
    } else {
      setSelectedAdminId('');
      setNotes('');
    }
  }, [currentAssignment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId) return;
    onSave(selectedAdminId, notes);
    onClose();
  };

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentAssignment ? 'Pinda Pegawai Pengesah Bulanan' : 'Tetapkan Pegawai Pengesah Bulanan'}
      subtitle={`Bulan ${monthNames[month - 1]} ${year} • ${school?.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
          <p className="font-bold">Sekolah: {school?.name} ({school?.code})</p>
          <p>Zon: <strong>{school?.zone_name || 'Belum Ditetapkan'}</strong></p>
          <p className="text-[11px] text-blue-700 mt-1">
            Penetapan ini hanya sah bagi Bulan <strong>{monthNames[month - 1]} {year}</strong>. Rekod pengesahan bulan lalu kekal terpelihara dalam arkib sejarah.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pilih Pegawai Admin Zon Sebagai Pengesah Utama:
          </label>
          <select
            required
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="">-- Pilih Pegawai Admin --</option>
            {adminUsers
              .filter((u) => u.role === 'ADMIN_ZON' || u.role === 'SUPER_ADMIN')
              .map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name} ({admin.role === 'SUPER_ADMIN' ? 'Head Admin' : 'Admin Zon'})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan / Justifikasi Penugasan
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="cth: Penugasan rasmi pengesah kehadiran sesi persekolahan..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!selectedAdminId}>
            Sahkan Penetapan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

