import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  AlertCircle,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

export const JustificationReviewPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [justifications, setJustifications] = useState<any[]>(() => dbService.getJustifications());
  const [selectedJust, setSelectedJust] = useState<any | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadJustifications = async () => {
    setIsLoading(true);
    try {
      const synced = await dbService.syncJustificationsFromSupabase();
      setJustifications(synced);
    } catch {
      setJustifications(dbService.getJustifications());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJustifications();
  }, []);

  const handleOpenReview = (just: any) => {
    setSelectedJust(just);
    setReviewRemarks('');
    setIsModalOpen(true);
  };

  const handleDecision = (decision: 'DISAHKAN' | 'DITOLAK') => {
    if (!selectedJust || !user) return;

    dbService.updateJustificationStatus(selectedJust.id, decision, reviewRemarks, user);

    setJustifications((prev) =>
      prev.map((j) => (j.id === selectedJust.id ? { ...j, status: decision, review_remarks: reviewRemarks } : j))
    );
    showToast(
      `Justifikasi ${selectedJust.pgb_name || selectedJust.user_name} telah ${decision === 'DISAHKAN' ? 'DILULUSKAN' : 'DITOLAK'}.`,
      decision === 'DISAHKAN' ? 'success' : 'warning'
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            Semakan Justifikasi & Dokumen Sokongan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Semak rayuan kelewatan, rekod tidak lengkap, dan urusan tugas luar yang dihantar oleh Pengetua dan Guru Besar.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadJustifications}
          isLoading={isLoading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Muat Semula
        </Button>
      </div>

      {/* Justifications Grid or Empty State */}
      {justifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tiada Justifikasi Menunggu Semakan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Semua justifikasi telah disemak, atau tiada permohonan baharu dihantar oleh Pengetua dan Guru Besar buat masa ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {justifications.map((just) => {
            const pgbName = just.pgb_name || just.user_name || 'Pengetua / Guru Besar';
            const schoolName = just.school_name || 'Sekolah Bertugas';
            const zoneName = just.zone_name || '';
            const categoryName = (just.category || just.reason_category || 'URUSAN_RASMI').replace(/_/g, ' ');
            const isApproved = just.status === 'DISAHKAN' || just.status === 'DILULUSKAN';
            const isRejected = just.status === 'DITOLAK';
            const isPending = just.status === 'MENUNGGU_SEMAKAN' || (!isApproved && !isRejected);

            const docs: string[] = Array.isArray(just.documents)
              ? just.documents.map((d: any) => (typeof d === 'string' ? d : d.name || 'Dokumen_Sokongan.pdf'))
              : [];

            return (
              <div
                key={just.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        isApproved
                          ? 'success'
                          : isRejected
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {isApproved
                        ? 'Diluluskan'
                        : isRejected
                        ? 'Ditolak'
                        : 'Menunggu Semakan'}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-medium">{just.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{pgbName}</h4>
                  <p className="text-xs font-semibold text-blue-700 mt-0.5">
                    {schoolName} {zoneName ? `• ${zoneName}` : ''}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">
                      Kategori: {categoryName}
                    </span>
                    <p className="text-slate-600 leading-relaxed">{just.description}</p>
                  </div>

                  {docs.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px] text-blue-600 underline font-medium cursor-pointer">
                        {docs[0]}
                      </span>
                    </div>
                  )}
                </div>

                {isPending && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenReview(just)}
                    >
                      Semak & Beri Keputusan
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Keputusan Semakan Justifikasi"
        subtitle={`Semakan bagi ${selectedJust?.pgb_name || selectedJust?.user_name} (${selectedJust?.school_name})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-800">Alasan Dikemukakan:</p>
            <p className="text-slate-600">{selectedJust?.description}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Ulasan Pegawai Penyemak
            </label>
            <textarea
              rows={3}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              placeholder="cth: Justifikasi diterima. Surat panggilan mesyuarat disahkan oleh Sektor Pentaksiran."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDecision('DITOLAK')}
              icon={<XCircle className="w-3.5 h-3.5" />}
            >
              Tolak Justifikasi
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDecision('DISAHKAN')}
              icon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Luluskan Justifikasi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

