import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { useToast } from '@/context/ToastContext';

export const UserDevicePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [deviceModel, setDeviceModel] = useState('');
  const [reason, setReason] = useState('');

  if (!user) return null;

  const devices = dbService.getUserDevices(user.id);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel.trim() || !reason.trim()) {
      alert('Sila lengkapkan maklumat.');
      return;
    }
    dbService.requestDeviceReplacement(user.id, deviceModel, reason, user);
    setModalOpen(false);
    setDeviceModel('');
    setReason('');
    showToast(
      'Permohonan pertukaran peranti telah dihantar kepada Super Admin PPD Tuaran.',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pengurusan Peranti PGB
          </h2>
          <p className="text-xs text-slate-400">
            Kawalan pengikatan peranti mudah alih (Device Binding) bagi mencegah manipulasi kehadiran.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Mohon Peranti Baharu
        </button>
      </div>

      {/* Security Rule Info */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Dasar Satu Peranti Satu PGB:</strong> Setiap Pengetua dan Guru Besar hanya
          dibenarkan menggunakan satu peranti mudah alih berdaftar pada satu masa untuk tujuan
          pengesahan biometrik dan geofence GPS. Sebarang pertukaran telefon memerlukan kelulusan
          Pentadbir Sistem PPD Tuaran.
        </div>
      </div>

      {/* Registered Devices List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Senarai Peranti Berdaftar
        </h3>

        {devices.map((d) => (
          <div
            key={d.id}
            className="p-5 rounded-3xl bg-[#0b1322] border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {d.device_name}
                    {d.is_primary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Utama (Primary)
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">{d.device_model}</p>
                </div>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    d.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : d.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {d.status === 'ACTIVE' ? 'DILULUSKAN' : d.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 block">Sistem Operasi:</span>
                <span className="font-semibold text-slate-300">{d.os_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tarikh Didaftarkan:</span>
                <span className="font-semibold text-slate-300">
                  {new Date(d.registered_at).toLocaleDateString('ms-MY')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Penggunaan Terakhir:</span>
                <span className="font-semibold text-slate-300">
                  {d.last_used_at
                    ? new Date(d.last_used_at).toLocaleDateString('ms-MY')
                    : 'Hari ini'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">ID Unik Peranti (UUID):</span>
                <span className="font-mono text-slate-400 truncate block">
                  {d.device_uuid}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REQUEST MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Mohon Pertukaran Peranti</h4>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Model Peranti Baharu
                </label>
                <input
                  type="text"
                  required
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="cth: iPhone 15 Pro / Samsung Galaxy S24"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Sebab Pertukaran Peranti
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nyatakan sebab seperti pertukaran telefon baharu, kerosakan skrin, atau kehilangan peranti..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl"
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
