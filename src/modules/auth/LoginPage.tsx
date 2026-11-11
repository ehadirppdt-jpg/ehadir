import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  School,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin.super@ppdtuaran.edu.my');
  const [password, setPassword] = useState('Password@123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
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

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Password@123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-100/90 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="bg-navy-900 px-8 py-8 text-center text-white relative">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl mx-auto mb-3 font-extrabold text-2xl ring-4 ring-blue-500/30">
            eH
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">e-HADIR TUARAN</h2>
          <p className="text-xs text-blue-200 font-medium mt-1">
            Portal Pentadbiran Pejabat Pendidikan Daerah Tuaran
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800 text-[11px] text-slate-300 font-semibold border border-navy-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Akses Pentadbir Sahaja
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Emel Rasmi Pentadbir
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.super@ppdtuaran.edu.my"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Laluan
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
                >
                  Lupa Kata Laluan?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold shadow-md"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Log Masuk ke Portal Pentadbiran
            </Button>
          </form>

          {/* Role testing shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pilih Akaun Ujian Pantas (Demo Verifier)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin.super@ppdtuaran.edu.my')}
                className="p-2 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-blue-800 border border-blue-200 text-left transition-colors"
              >
                <p className="font-bold">Head Admin</p>
                <p className="text-[10px] text-blue-600 truncate">Akses Penuh 6 Zon</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.tenghilan@ppdtuaran.edu.my')}
                className="p-2 rounded-lg bg-teal-50/70 hover:bg-teal-100 text-teal-800 border border-teal-200 text-left transition-colors"
              >
                <p className="font-bold">Admin Zon Z01/Z02</p>
                <p className="text-[10px] text-teal-600 truncate">Zon Tenghilan/Mengkabong</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.monitoring@ppdtuaran.edu.my')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-left transition-colors"
              >
                <p className="font-bold">Monitoring Admin</p>
                <p className="text-[10px] text-slate-600 truncate">Read-Only View</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('khairul.abdullah@moe.gov.my')}
                className="p-2 rounded-lg bg-rose-50/70 hover:bg-rose-100 text-rose-800 border border-rose-200 text-left transition-colors"
                title="Akaun PGB disekat daripada log masuk ke Admin Portal"
              >
                <p className="font-bold">Akaun PGB (Uji Sekatan)</p>
                <p className="text-[10px] text-rose-600 truncate">Disekat Akses Admin</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Pendaftaran awam tidak dibenarkan. Hanya pentadbir yang diberi kuasa boleh log masuk.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Tetapan Semula Kata Laluan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan emel rasmi pentadbir anda. Pautan penetapan semula akan dihantar ke peti masuk anda.
            </p>

            {forgotSent ? (
              <div className="my-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center">
                Pautan pengesahan telah dihantar ke <strong>{forgotEmail}</strong>. Sila semak emel anda.
              </div>
            ) : (
              <div className="my-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emel Rasmi</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin.super@ppdtuaran.edu.my"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
              >
                Tutup
              </Button>
              {!forgotSent && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (forgotEmail) setForgotSent(true);
                  }}
                >
                  Hantar Pautan
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
