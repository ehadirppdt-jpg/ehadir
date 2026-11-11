import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, KeyRound, Save, Building } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState(user?.phone_number || '019-8812345');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Nombor telefon rasmi berjaya dikemaskini.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd) return;
    showToast('Kata laluan berjaya ditukar.', 'success');
    setCurrentPwd('');
    setNewPwd('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Profil Pegawai Pentadbir
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Maklumat akaun pentadbiran, tahap capaian keselamatan, dan tetapan keselamatan katalaluan.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-navy-900 text-white flex items-center justify-center font-extrabold text-2xl ring-4 ring-blue-100 shrink-0 shadow-md">
          {user?.full_name?.charAt(0) || 'A'}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{user?.full_name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{user?.position}</p>
            </div>
            <Badge
              variant={user?.role === 'SUPER_ADMIN' ? 'primary' : 'purple'}
              size="md"
            >
              {user?.role === 'SUPER_ADMIN'
                ? 'Ketua Pentadbir (Head Admin)'
                : user?.role === 'ADMIN_ZON'
                ? 'Pentadbir Zon'
                : 'Monitoring Admin'}
            </Badge>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Emel Rasmi:</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">No. Kad Pengenalan:</span>
              <span className="font-mono font-semibold text-slate-800">
                {user?.ic_no?.replace(/(\d{6})(\d{2})(\d{4})/, '$1-$2-$3') || '710412-12-5587'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status Akaun:</span>
              <span className="font-bold text-emerald-600">Aktif & Sah</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info update */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            Kemaskini No. Telefon
          </h4>

          <form onSubmit={handleUpdateContact} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telefon Bimbit
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <Button variant="primary" size="sm" type="submit" icon={<Save className="w-4 h-4" />}>
              Simpan Maklumat
            </Button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            Tukar Kata Laluan
          </h4>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Laluan Semasa
              </label>
              <input
                type="password"
                required
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Laluan Baharu
              </label>
              <input
                type="password"
                required
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <Button variant="primary" size="sm" type="submit" icon={<Save className="w-4 h-4" />}>
              Kemaskini Kata Laluan
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

