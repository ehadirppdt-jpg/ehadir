import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { UserProfile, School, UserRoleType, AccountStatusType } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  schools: School[];
  onSave: (userData: Partial<UserProfile> & { newPassword?: string }) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  schools,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [icNo, setIcNo] = useState('');
  const [position, setPosition] = useState('Guru Besar');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [role, setRole] = useState<UserRoleType>('PGB');
  const [status, setStatus] = useState<AccountStatusType>('ACTIVE');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setIcNo(user.ic_no);
      setPosition(user.position);
      setEmail(user.email);
      setPhone(user.phone_number || '');
      setSchoolId(user.assigned_school_id || '');
      setCustomSchoolName(user.school_name || '');
      setRole(user.role);
      setStatus(user.status);
    } else {
      setFullName('');
      setIcNo('');
      setPosition('Guru Besar');
      setEmail('');
      setPhone('');
      setSchoolId('');
      setCustomSchoolName('');
      setRole('PGB');
      setStatus('ACTIVE');
    }
    setNewPassword('');
    setShowPassword(false);
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedSchool = schools.find((s) => s.id === schoolId);

    onSave({
      full_name: fullName.trim().toUpperCase(),
      ic_no: icNo.trim().replace(/[^0-9]/g, ''),
      position: position.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone.trim(),
      role,
      status,
      assigned_school_id: schoolId || undefined,
      school_name: assignedSchool ? assignedSchool.name : (customSchoolName.trim().toUpperCase() || undefined),
      ...(newPassword.trim() ? { newPassword: newPassword.trim(), password: newPassword.trim() } : {}),
    } as any);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Kemaskini ${user.full_name}` : 'Daftar Akaun Pengetua / Guru Besar (PGB)'}
      subtitle="Akaun ini akan dipautkan kepada portal kehadiran pengguna fasa hadapan"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Penuh (Mengikut Kad Pengenalan)
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="MOHD KHAIRUL BIN ABDULLAH"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombor Kad Pengenalan (No. KP)
            </label>
            <input
              type="text"
              required
              value={icNo}
              onChange={(e) => setIcNo(e.target.value)}
              placeholder="750214125541"
              maxLength={12}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jawatan Rasmi</label>
            <input
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Guru Besar Cemerlang DG48"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emel Rasmi KPM</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@moe.gov.my"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telefon Bimbit</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="019-8765432"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Kata Laluan — ditunjuk kepada Super Admin sahaja */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {user ? 'Kata Laluan Baharu (Kosongkan jika tidak mahu tukar)' : 'Kata Laluan Awal'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={user ? 'Masukkan kata laluan baharu...' : 'Min. 8 aksara'}
              minLength={newPassword ? 8 : undefined}
              className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Penetapan Sekolah Bertugas
          </label>
          {schools.length > 0 ? (
            <select
              value={schoolId}
              onChange={(e) => {
                setSchoolId(e.target.value);
                const s = schools.find((sch) => sch.id === e.target.value);
                if (s) setCustomSchoolName(s.name);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">-- Pilih Sekolah --</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name} ({s.zone_name || 'Tanpa Zon'})
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                value={customSchoolName}
                onChange={(e) => setCustomSchoolName(e.target.value)}
                placeholder="Masukkan Nama Sekolah (cth: SK PEKAN TUARAN)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
              />
              <p className="text-[11px] text-slate-400">
                Pangkalan data sekolah dikosongkan. Anda boleh taip nama sekolah atau daftar sekolah di menu Pengurusan Sekolah.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Peranan Sistem</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRoleType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="PGB">PGB (Pengetua / Guru Besar)</option>
              <option value="ADMIN_ZON">Admin Zon</option>
              <option value="MONITORING_ADMIN">Monitoring Admin</option>
              <option value="SUPER_ADMIN">Ketua Pentadbir (Super Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Akaun</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatusType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="ACTIVE">Aktif (Boleh Hadir)</option>
              <option value="INACTIVE">Nyahaktif</option>
              <option value="SUSPENDED">Digantung</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {user ? 'Simpan Perubahan' : 'Cipta Akaun PGB'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

