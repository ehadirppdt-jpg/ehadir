import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Zone, UserProfile } from '@/types';

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: Zone | null;
  adminUsers: UserProfile[];
  onSave: (zoneData: Partial<Zone>) => void;
}

export const ZoneModal: React.FC<ZoneModalProps> = ({
  isOpen,
  onClose,
  zone,
  adminUsers,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState('#2563EB');
  const [description, setDescription] = useState('');
  const [assignedAdminId, setAssignedAdminId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (zone) {
      setCode(zone.code);
      setName(zone.name);
      setColorHex(zone.color_hex);
      setDescription(zone.description || '');
      setAssignedAdminId(zone.assigned_admin_id || '');
      setIsActive(zone.is_active);
    } else {
      setCode('');
      setName('');
      setColorHex('#2563EB');
      setDescription('');
      setAssignedAdminId('');
      setIsActive(true);
    }
  }, [zone, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = adminUsers.find((u) => u.id === assignedAdminId);
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim().toUpperCase(),
      color_hex: colorHex,
      description: description.trim(),
      assigned_admin_id: assignedAdminId || undefined,
      assigned_admin_name: admin ? admin.full_name : undefined,
      is_active: isActive,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={zone ? `Kemaskini ${zone.code}` : 'Tambah Zon Pentadbiran Baharu'}
      subtitle="Konfigurasi kod zon, warna pengenalan dan pegawai pentadbir zon"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kod Zon (cth: Z07)
            </label>
            <input
              type="text"
              required
              disabled={!!zone}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Z07"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warna Pengenalan
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-9 p-0.5 border border-slate-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Zon Pentadbiran
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ZON BANDAR TUARAN"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pegawai Admin Zon Ditugaskan
          </label>
          <select
            value={assignedAdminId}
            onChange={(e) => setAssignedAdminId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="">-- Belum Ditugaskan --</option>
            {adminUsers
              .filter((u) => u.role === 'ADMIN_ZON' || u.role === 'SUPER_ADMIN')
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Penerangan</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan kawasan sekolah di bawah zon ini..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="zone_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="zone_active" className="text-xs font-medium text-slate-700 cursor-pointer">
            Zon Aktif dalam Operasi Sekolah
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {zone ? 'Simpan Perubahan' : 'Cipta Zon'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
