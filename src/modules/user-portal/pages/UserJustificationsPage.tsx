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
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Diluluskan
          </span>
        );
      case 'MENUNGGU_SEMAKAN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Menunggu Semakan
          </span>
        );
      case 'DIKEMBALIKAN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Dikembalikan
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
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
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Justifikasi Kehadiran
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Penyerahan penjelasan bagi rekod kehadiran yang tidak lengkap atau kekurangan jam bertugas.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Cipta Justifikasi Baharu
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Semua ({justifications.length})
        </button>
        <button
          onClick={() => setActiveTab('MENUNGGU_SEMAKAN')}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'MENUNGGU_SEMAKAN'
              ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Menunggu Semakan ({justifications.filter((j) => j.status === 'MENUNGGU_SEMAKAN').length})
        </button>
        <button
          onClick={() => setActiveTab('DILULUSKAN')}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'DILULUSKAN'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Diluluskan ({justifications.filter((j) => j.status === 'DILULUSKAN' || j.status === 'DISAHKAN').length})
        </button>
        <button
          onClick={() => setActiveTab('DIKEMBALIKAN')}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'DIKEMBALIKAN'
              ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Dikembalikan ({justifications.filter((j) => j.status === 'DIKEMBALIKAN').length})
        </button>
      </div>

      {/* Justifications List */}
      <div className="space-y-3">
        {filteredJustifications.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-gray-200 text-center shadow-sm">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Tiada rekod justifikasi dalam tab ini.</p>
          </div>
        ) : (
          filteredJustifications.map((j) => (
            <div
              key={j.id}
              className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900">
                    {j.reason_category.replace(/_/g, ' ')}
                  </span>
                  {getStatusBadge(j.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Tarikh Kejadian: <strong className="text-gray-700">{j.date}</strong>
                  </span>
                  <span>•</span>
                  <span>Dihantar: {new Date(j.submitted_at).toLocaleDateString('ms-MY')}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1 italic">
                  "{j.description}"
                </p>
                {j.review_remarks && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg mt-1">
                    <strong>Catatan Admin:</strong> {j.review_remarks}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setViewModalItem(j)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-gray-900">Cipta Justifikasi Kehadiran</h4>
                <p className="text-xs text-gray-500">Borang penjelasan rasmi kepada Admin Zon</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitJustification} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Kategori Justifikasi (9 Kategori Rasmi)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
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
                  <label className="block text-gray-700 font-semibold mb-1">Tarikh Kejadian</label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Masa Terlibat</label>
                  <input
                    type="time"
                    required
                    value={timeRelated}
                    onChange={(e) => setTimeRelated(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Penjelasan Terperinci
                </label>
                <textarea
                  required
                  rows={4}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Nyatakan sebab ketidakhadiran, tugas rasmi atau masalah teknikal yang dihadapi secara terperinci..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Muat Naik Lampiran Sokongan (PDF, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 hover:border-emerald-400 transition-colors">
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
                    <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    {attachedFileName ? (
                      <span className="text-emerald-700 font-bold block truncate">
                        {attachedFileName}
                      </span>
                    ) : (
                      <span className="text-gray-500 block text-[11px]">
                        Klik untuk memilih dokumen sokongan rasmi (cth: Surat Panggilan / Sijil Sakit)
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-gray-900">Perincian Justifikasi</h4>
                <p className="text-xs text-gray-500">ID: {viewModalItem.id}</p>
              </div>
              <button
                onClick={() => setViewModalItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Status Semakan:</span>
                  {getStatusBadge(viewModalItem.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Kategori:</span>
                  <span className="font-semibold text-gray-900">
                    {viewModalItem.reason_category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Tarikh Kejadian:</span>
                  <span className="font-semibold text-gray-900">{viewModalItem.date}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-500 block mb-1 font-medium">Penjelasan Pemohon:</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 leading-relaxed italic">
                  "{viewModalItem.description}"
                </div>
              </div>

              {viewModalItem.review_remarks && (
                <div>
                  <label className="text-amber-700 block mb-1 font-semibold">
                    Catatan Pegawai Pengesah (Admin Zon):
                  </label>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 leading-relaxed">
                    {viewModalItem.review_remarks}
                  </div>
                </div>
              )}

              {viewModalItem.documents && viewModalItem.documents.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    {viewModalItem.documents[0].name}
                  </span>
                  <a
                    href={viewModalItem.documents[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-bold text-[11px]"
                  >
                    Buka Dokumen
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewModalItem(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
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
