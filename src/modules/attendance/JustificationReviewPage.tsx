import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';

export const JustificationReviewPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [justifications, setJustifications] = useState([
    {
      id: 'just-001',
      pgb_name: 'Pn. Sarah binti Othman',
      school_name: 'SMK BADIN',
      zone_name: 'ZON MENGKABONG',
      date: '2026-11-11',
      category: 'TUGASAN_RASMI_LUAR',
      description: 'Menghadiri Mesyuarat Penyelarasan Peperiksaan SPM di Sektor Pentaksiran PPD Tuaran jam 07:30 pagi.',
      status: 'MENUNGGU_SEMAKAN',
      submitted_at: '2026-11-11T09:15:00Z',
      documents: ['Surat_Panggilan_Mesyuarat_SPM.pdf'],
    },
    {
      id: 'just-002',
      pgb_name: 'En. Richard bin Gampalid',
      school_name: 'SK KIULU',
      zone_name: 'ZON KIULU',
      date: '2026-11-11',
      category: 'KECEMASAN',
      description: 'Jalan terputus akibat tanah runtuh di laluan Tamparuli-Kiulu. Tiba lewat di sekolah selepas laluan dibuka.',
      status: 'MENUNGGU_SEMAKAN',
      submitted_at: '2026-11-11T09:45:00Z',
      documents: ['Gambar_Kejadian_Runtuh.jpg'],
    },
  ]);

  const [selectedJust, setSelectedJust] = useState<any | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenReview = (just: any) => {
    setSelectedJust(just);
    setReviewRemarks('');
    setIsModalOpen(true);
  };

  const handleDecision = (decision: 'DISAHKAN' | 'DITOLAK') => {
    if (!selectedJust) return;
    setJustifications((prev) =>
      prev.map((j) => (j.id === selectedJust.id ? { ...j, status: decision } : j))
    );
    showToast(
      `Justifikasi ${selectedJust.pgb_name} telah ${decision === 'DISAHKAN' ? 'DILULUSKAN' : 'DITOLAK'}.`,
      decision === 'DISAHKAN' ? 'success' : 'warning'
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-blue-600" />
          Semakan Justifikasi & Dokumen Sokongan
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Semak rayuan kelewatan, rekod tidak lengkap, dan urusan tugas luar yang dihantar oleh Pengetua dan Guru Besar.
        </p>
      </div>

      {/* Justifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {justifications.map((just) => (
          <div
            key={just.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    just.status === 'DISAHKAN'
                      ? 'success'
                      : just.status === 'DITOLAK'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {just.status === 'DISAHKAN'
                    ? 'Diluluskan'
                    : just.status === 'DITOLAK'
                    ? 'Ditolak'
                    : 'Menunggu Semakan'}
                </Badge>
                <span className="text-[11px] text-slate-400 font-medium">{just.date}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{just.pgb_name}</h4>
              <p className="text-xs font-semibold text-blue-700 mt-0.5">
                {just.school_name} • {just.zone_name}
              </p>

              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  Kategori: {just.category.replace(/_/g, ' ')}
                </span>
                <p className="text-slate-600 leading-relaxed">{just.description}</p>
              </div>

              {just.documents.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] text-blue-600 underline font-medium cursor-pointer">
                    {just.documents[0]}
                  </span>
                </div>
              )}
            </div>

            {just.status === 'MENUNGGU_SEMAKAN' && (
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
        ))}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Keputusan Semakan Justifikasi"
        subtitle={`Semakan bagi ${selectedJust?.pgb_name} (${selectedJust?.school_name})`}
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
