import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth, PortalModeType } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, setPortalMode } = useAuth();
  const [selectedPortal, setSelectedPortal] = useState<PortalModeType>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handlePortalSwitch = (portal: PortalModeType) => {
    setSelectedPortal(portal);
    setPortalMode(portal);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password, selectedPortal);
      if (result.success) {
        onSuccess();
      } else {
        setErrorMessage(result.error || 'Log masuk gagal');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ralat sambungan pelayan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background visual accents */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Banner with Portal Selector */}
        <div className="bg-slate-950 px-8 pt-7 pb-6 text-center relative border-b border-slate-800">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-3 font-extrabold text-2xl ring-4 ${
              selectedPortal === 'USER'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-emerald-500/20'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-blue-500/20'
            }`}
          >
            eH
          </div>
          <h2 className="text-xl font-extrabold tracking-wider text-white">e-HADIR TUARAN</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Pejabat Pendidikan Daerah Tuaran, Sabah
          </p>

          {/* Portal Switcher Tabs */}
          <div className="mt-4 grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => handlePortalSwitch('USER')}
              className={`py-1.5 rounded-lg transition-all ${
                selectedPortal === 'USER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Portal Pengguna (PGB)
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('ADMIN')}
              className={`py-1.5 rounded-lg transition-all ${
                selectedPortal === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Portal Pentadbiran
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-7">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {selectedPortal === 'USER' ? 'Emel Rasmi / ID Pengetua & Guru Besar' : 'Emel Rasmi Pentadbir'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedPortal === 'USER'
                      ? 'sarah.othman@moe.gov.my'
                      : 'admin.super@ppdtuaran.edu.my'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Kata Laluan
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-emerald-400 hover:underline font-semibold"
                >
                  Lupa Kata Laluan?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                selectedPortal === 'USER'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950'
              }`}
            >
              {isSubmitting ? (
                'Mengesahkan Kredensial...'
              ) : (
                <>
                  <span>
                    Log Masuk ke {selectedPortal === 'USER' ? 'Portal Pengguna (PGB)' : 'Portal Pentadbiran'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-8 py-3.5 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Akses rasmi Pejabat Pendidikan Daerah Tuaran. Pendaftaran awam tidak dibenarkan.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-white animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-white">Tetapan Semula Kata Laluan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Masukkan emel rasmi MOE anda. Pautan penetapan semula akan dihantar ke peti masuk anda.
            </p>

            {forgotSent ? (
              <div className="my-5 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs text-center">
                Pautan pengesahan telah dihantar ke <strong>{forgotEmail}</strong>. Sila semak emel anda.
              </div>
            ) : (
              <div className="my-4 text-xs">
                <label className="block font-semibold text-slate-300 mb-1">Emel Rasmi</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama.pengetua@moe.gov.my"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Tutup
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail) setForgotSent(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Hantar Pautan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
