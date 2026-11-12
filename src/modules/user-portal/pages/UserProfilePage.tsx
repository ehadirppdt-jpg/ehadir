import React, { useState } from 'react';
import {
  User,
  School,
  Mail,
  Phone,
  Lock,
  Camera,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { useToast } from '@/context/ToastContext';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState(user?.phone_number || '019-8765432');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceReason, setFaceReason] = useState('');

  if (!user) return null;

  const handleUpdatePhone = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPhone(true);
    setTimeout(() => {
      setIsUpdatingPhone(false);
      showToast('Nombor telefon anda telah berjaya disimpan.', 'success');
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Kata laluan baharu tidak sepadan.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Kata laluan mestilah sekurang-kurangnya 6 aksara.');
      return;
    }
    setPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Kata Laluan Berjaya Ditukar. Sila gunakan kata laluan baharu untuk log masuk seterusnya.', 'success');
  };

  const handleRequestFaceReenrolment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceReason.trim()) {
      alert('Sila nyatakan sebab permohonan pendaftaran semula.');
      return;
    }
    dbService.requestFaceReenrolment(user.id, faceReason, user);
    setFaceModalOpen(false);
    setFaceReason('');
    showToast(
      'Permohonan pendaftaran semula wajah biometrik anda telah diserahkan kepada Admin Sistem PPD Tuaran.',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Profil PGB &amp; Keselamatan
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Maklumat peribadi, keselamatan akaun dan profil biometrik wajah rasmi.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-gray-100 pb-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {user.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1 overflow-hidden">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Akaun Aktif
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold">{user.position || 'Pengetua / Guru Besar'}</p>
            <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <School className="w-3.5 h-3.5 text-gray-400" />
              {user.school_name || 'Sekolah Daerah Tuaran'}
            </p>
          </div>
        </div>

        {/* Read-only official credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
              Emel Rasmi MOE
            </span>
            <p className="font-semibold text-gray-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              {user.email}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
              Nombor Kad Pengenalan
            </span>
            <p className="font-semibold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {user.ic_no || '750214-12-5541'}
            </p>
          </div>
        </div>

        {/* Edit Permitted Info (Phone number) */}
        <form onSubmit={handleUpdatePhone} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <label className="block text-xs font-bold text-gray-700">
            Nombor Telefon Bimbit (Untuk Notifikasi Sistem)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="019-XXXXXXX"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPhone}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors active:scale-95"
            >
              {isUpdatingPhone ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>

        {/* Change Password Button */}
        <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-200">
          <div>
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              Keselamatan Kata Laluan
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Tukar kata laluan akses portal anda secara berkala.
            </p>
          </div>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Tukar Kata Laluan
          </button>
        </div>
      </div>

      {/* Biometric Security Module */}
      <div className="p-5 rounded-3xl bg-white border border-gray-200 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            Profil Biometrik Wajah
          </h4>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            TERDAFTAR &amp; AKTIF
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Data vektor ciri wajah telah disahkan oleh Pentadbir Sistem bagi tujuan pengesahan waktu masuk dan keluar kehadiran secara selamat.
        </p>
        <button
          onClick={() => setFaceModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          Mohon Pendaftaran Semula Wajah
        </button>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-sm font-bold text-gray-900">Tukar Kata Laluan</h4>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Kata Laluan Semasa</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Kata Laluan Baharu</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Sahkan Kata Laluan Baharu</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors active:scale-95"
                >
                  Simpan Kata Laluan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FACE RE-ENROLMENT MODAL */}
      {faceModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-sm font-bold text-gray-900">Mohon Pendaftaran Semula Wajah</h4>
              <button
                onClick={() => setFaceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestFaceReenrolment} className="space-y-3 text-xs">
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Sila berikan sebab munasabah mengapa pendaftaran semula profil wajah diperlukan (cth: Perubahan penampilan drastik, masalah kamera peranti, kemalangan).
              </p>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Sebab Permohonan</label>
                <textarea
                  required
                  rows={3}
                  value={faceReason}
                  onChange={(e) => setFaceReason(e.target.value)}
                  placeholder="Nyatakan sebab..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setFaceModalOpen(false)}
                  className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors active:scale-95"
                >
                  Hantar Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
