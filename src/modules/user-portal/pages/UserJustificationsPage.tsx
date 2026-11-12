import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Calendar,
  Paperclip,
  RotateCcw,
  Eye,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { Justification, JustificationStatusType } from '@/types';
import { useToast } from '@/context/ToastContext';

export const UserJustificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ALL' | 'MENUNGGU_SEMAKAN' | 'DILULUSKAN' | 'DIKEMBALIKAN'>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalItem, setViewModalItem] = useState<Justification | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('URUSAN_RASMI');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeRelated, setTimeRelated] = useState('08:00');
  const [reasonText, setReasonText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const justifications = dbService.getUserJustifications(user.id);

  const filteredJustifications = justifications.filter((j) => {
    if (activeTab === 'ALL') return true;
    return j.status === activeTab;
  });

  const categories: { label: string; value: string }[] = [
    { label: 'Urusan Rasmi', value: 'URUSAN_RASMI' },
    { label: 'Mesyuarat Luar', value: 'MESYUARAT_LUAR' },
    { label: 'Tugas Rasmi di PPD', value: 'TUGAS_RASMI_PPD' },
    { label: 'Lewat Hadir', value: 'LEWAT_HADIR' },
    { label: 'Pulang Awal', value: 'PULANG_AWAL' },
    { label: 'Masalah Teknikal', value: 'MASALAH_TEKNIKAL' },
    { label: 'Tiada Rekod Masuk', value: 'TIADA_REKOD_MASUK' },
    { label: 'Tiada Rekod Keluar', value: 'TIADA_REKOD_KELUAR' },
    { label: 'Lain-lain', value: 'LAIN_LAIN' },
  ];

  const handleSubmitJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonText.trim()) {
      alert('Sila masukkan penjelasan justifikasi anda.');
      return;
    }

    setIsSubmitting(true);
    const result = dbService.submitJustification(
      {
        userId: user.id,
        date: incidentDate,
        reason_category: selectedCategory,
        description: reasonText,
        documents: attachedFileName
          ? [{ name: attachedFileName, url: `https://storage.ppdtuaran.edu.my/justifications/${attachedFileName}`, size: 'PDF' }]
          : [],
      },
      user
    );

    setIsSubmitting(false);
    if (result.success) {
      showToast(
        'Justifikasi Dihantar! Permohonan justifikasi anda telah dihantar kepada Admin Zon untuk semakan.',
        'success'
      );
      setCreateModalOpen(false);
      setReasonText('');
      setAttachedFileName('');
      setRefreshTrigger((prev) => prev + 1);
    } else {
      alert(result.error || 'Gagal menghantar justifikasi');
    }
  };

  const getStatusBadge = (status: JustificationStatusType) => {
    switch (status) {
      case 'DILULUSKAN':
      case 'DISAHKAN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Diluluskan
          </span>
        );
      case 'MENUNGGU_SEMAKAN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Menunggu Semakan
          </span>
        );
      case 'DIKEMBALIKAN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Dikembalikan
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Justifikasi Kehadiran
          </h2>
          <p className="text-xs text-slate-400">
            Penyerahan penjelasan bagi rekod kehadiran yang tidak lengkap atau kekurangan jam bertugas.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cipta Justifikasi Baharu
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'ALL'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Semua ({justifications.length})
        </button>
        <button
          onClick={() => setActiveTab('MENUNGGU_SEMAKAN')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'MENUNGGU_SEMAKAN'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Menunggu Semakan ({justifications.filter((j) => j.status === 'MENUNGGU_SEMAKAN').length})
        </button>
        <button
          onClick={() => setActiveTab('DILULUSKAN')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'DILULUSKAN'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Diluluskan ({justifications.filter((j) => j.status === 'DILULUSKAN' || j.status === 'DISAHKAN').length})
        </button>
        <button
          onClick={() => setActiveTab('DIKEMBALIKAN')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'DIKEMBALIKAN'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dikembalikan ({justifications.filter((j) => j.status === 'DIKEMBALIKAN').length})
        </button>
      </div>

      {/* Justifications List */}
      <div className="space-y-3">
        {filteredJustifications.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#0b1322] border border-slate-800 text-center text-slate-500 text-xs">
            Tiada rekod justifikasi dalam tab ini.
          </div>
        ) : (
          filteredJustifications.map((j) => (
            <div
              key={j.id}
              className="p-4 rounded-2xl bg-[#0b1322] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {j.reason_category.replace(/_/g, ' ')}
                  </span>
                  {getStatusBadge(j.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Tarikh Kejadian: <strong className="text-slate-300">{j.date}</strong>
                  </span>
                  <span>•</span>
                  <span>Dihantar: {new Date(j.submitted_at).toLocaleDateString('ms-MY')}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1 italic">
                  "{j.description}"
                </p>
                {j.review_remarks && (
                  <p className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/60 px-2.5 py-1 rounded-lg mt-1">
                    <strong>Catatan Admin:</strong> {j.review_remarks}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setViewModalItem(j)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lihat Perincian
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE JUSTIFICATION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">Cipta Justifikasi Kehadiran</h4>
                <p className="text-xs text-slate-400">Borang penjelasan rasmi kepada Admin Zon</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitJustification} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kategori Justifikasi (9 Kategori Rasmi)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tarikh Kejadian</label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Masa Terlibat</label>
                  <input
                    type="time"
                    required
                    value={timeRelated}
                    onChange={(e) => setTimeRelated(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Penjelasan Terperinci
                </label>
                <textarea
                  required
                  rows={4}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Nyatakan sebab ketidakhadiran, tugas rasmi atau masalah teknikal yang dihadapi secara terperinci..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Muat Naik Lampiran Sokongan (PDF, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-3 text-center bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
                  <input
                    type="file"
                    id="justification-doc"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="justification-doc" className="cursor-pointer">
                    <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    {attachedFileName ? (
                      <span className="text-emerald-400 font-bold block truncate">
                        {attachedFileName}
                      </span>
                    ) : (
                      <span className="text-slate-400 block text-[11px]">
                        Klik untuk memilih dokumen sokongan rasmi (cth: Surat Panggilan / Sijil Sakit)
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  Hantar Justifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW JUSTIFICATION MODAL */}
      {viewModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">Perincian Justifikasi</h4>
                <p className="text-xs text-slate-400">ID: {viewModalItem.id}</p>
              </div>
              <button
                onClick={() => setViewModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Semakan:</span>
                  {getStatusBadge(viewModalItem.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kategori:</span>
                  <span className="font-semibold text-white">
                    {viewModalItem.reason_category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tarikh Kejadian:</span>
                  <span className="font-semibold text-white">{viewModalItem.date}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Penjelasan Pemohon:</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed italic">
                  "{viewModalItem.description}"
                </div>
              </div>

              {viewModalItem.review_remarks && (
                <div>
                  <label className="text-amber-400 block mb-1 font-semibold">
                    Catatan Pegawai Pengesah (Admin Zon):
                  </label>
                  <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-900/60 text-amber-200 leading-relaxed">
                    {viewModalItem.review_remarks}
                  </div>
                </div>
              )}

              {viewModalItem.documents && viewModalItem.documents.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-emerald-400" />
                    {viewModalItem.documents[0].name}
                  </span>
                  <a
                    href={viewModalItem.documents[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline font-bold text-[11px]"
                  >
                    Buka Dokumen
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewModalItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
