import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { MonthlyAttendanceRecord, UserProfile } from '@/types';
import {
  CalendarCheck,
  FileCheck2,
  CheckCircle2,
  RotateCcw,
  XCircle,
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface MonthlyDetailReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MonthlyAttendanceRecord | null;
  actor: UserProfile;
  onAction: (
    action: 'DISAHKAN' | 'DIKEMBALIKAN' | 'DITOLAK',
    remarks: string
  ) => void;
}

export const MonthlyDetailReviewModal: React.FC<MonthlyDetailReviewModalProps> = ({
  isOpen,
  onClose,
  record,
  actor,
  onAction,
}) => {
  const [remarks, setRemarks] = useState('');
  const [activeTab, setActiveTab] = useState<'RINGKASAN' | 'HARIAN' | 'JUSTIFIKASI'>('RINGKASAN');

  if (!record) return null;

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Semakan Pengesahan Kehadiran Bulanan: ${record.pgb_name}`}
      subtitle={`Bulan ${monthNames[record.month - 1]} ${record.year} • ${record.school_name}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('RINGKASAN')}
            className={`pb-2.5 px-4 transition-all ${
              activeTab === 'RINGKASAN'
                ? 'border-b-2 border-blue-600 text-blue-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ringkasan Kehadiran Bulanan
          </button>
          <button
            onClick={() => setActiveTab('HARIAN')}
            className={`pb-2.5 px-4 transition-all ${
              activeTab === 'HARIAN'
                ? 'border-b-2 border-blue-600 text-blue-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log Harian ({record.total_working_days} Hari)
          </button>
          <button
            onClick={() => setActiveTab('JUSTIFIKASI')}
            className={`pb-2.5 px-4 transition-all ${
              activeTab === 'JUSTIFIKASI'
                ? 'border-b-2 border-blue-600 text-blue-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Justifikasi ({record.justified_days})
          </button>
        </div>

        {/* Tab 1: Ringkasan */}
        {activeTab === 'RINGKASAN' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Hari Bekerja</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{record.total_working_days}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-[10px] text-emerald-700 uppercase font-semibold">Hadir Penuh</p>
                <p className="text-lg font-extrabold text-emerald-800 mt-0.5">{record.present_days}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[10px] text-amber-700 uppercase font-semibold">Lewat Hadir</p>
                <p className="text-lg font-extrabold text-amber-800 mt-0.5">{record.late_days}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-[10px] text-blue-700 uppercase font-semibold">Jumlah Jam</p>
                <p className="text-lg font-extrabold text-blue-800 mt-0.5">{record.total_hours_rendered}j</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Pegawai Pengesah Ditugaskan:</span>
                <span className="font-bold text-slate-900">{record.assigned_approver_name || 'Pentadbir Zon'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarikh Penjanaan Laporan:</span>
                <span className="font-medium text-slate-700">
                  {new Date(record.generated_at).toLocaleString('ms-MY')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Semasa:</span>
                <span className="font-bold text-blue-700">{record.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Log Harian */}
        {activeTab === 'HARIAN' && (
          <div className="max-h-56 overflow-y-auto space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">11 November 2026</p>
                <p className="text-[11px] text-slate-500">07:22:10 AM — 04:35:40 PM</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Lengkap (9 jam 13 min)
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">10 November 2026</p>
                <p className="text-[11px] text-slate-500">07:48:30 AM — 04:30:00 PM</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                Lewat 18 min (Justifikasi Dilampirkan)
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Justifikasi */}
        {activeTab === 'JUSTIFIKASI' && (
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-2">
            <p className="font-bold text-amber-900">Justifikasi Kelewatan (10 November 2026):</p>
            <p className="text-amber-800 leading-relaxed">
              Tugasan luar: Menghadiri Mesyuarat Penyelarasan Peperiksaan SPM di PPD Tuaran.
            </p>
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold pt-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Surat_Panggilan_PPD_Tuaran.pdf (Disahkan)</span>
            </div>
          </div>
        )}

        {/* Decision & Remarks input */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ulasan Pengesah (Wajib sekiranya dikembalikan atau ditolak)
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Masukkan catatan semakan sebelum mengesahkan..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onAction('DITOLAK', remarks);
                onClose();
              }}
              icon={<XCircle className="w-3.5 h-3.5" />}
            >
              Tolak Laporan
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onAction('DIKEMBALIKAN', remarks);
                onClose();
              }}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Kembalikan Pembetulan
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onAction('DISAHKAN', remarks);
                onClose();
              }}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Sahkan Kehadiran Bulanan
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

