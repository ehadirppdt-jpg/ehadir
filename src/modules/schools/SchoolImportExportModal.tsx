import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseExcelOrCsv } from '@/lib/exportExcel';
import { dbService } from '@/lib/db';
import { UserProfile } from '@/types';

interface SchoolImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  actor: UserProfile;
  onSuccess: () => void;
}

export const SchoolImportExportModal: React.FC<SchoolImportExportModalProps> = ({
  isOpen,
  onClose,
  actor,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ added: number; updated: number; errors: string[] } | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    // Generate clean CSV template for user download
    const csvContent =
      'Kod_Sekolah,Nama_Sekolah,Kategori,Kod_Zon,Alamat,Poskod,Telefon,Emel,Latitud,Longitud,Radius_Geofence_Meter\n' +
      'XBA4001,SK PEKAN TUARAN,SK,Z03,Peti Surat 102,89208,088-788100,xba4001@moe.edu.my,6.130500,116.233200,100\n' +
      'XEA4040,SMK BADIN,SMK,Z02,Peti Surat 455,89208,088-788200,xea4040@moe.edu.my,6.155400,116.208500,150\n' +
      'XBA4015,SK TENGHILAN,SK,Z01,W.D.T 15,89250,088-782300,xba4015@moe.edu.my,6.216200,116.348100,120\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_sekolah_tuaran.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const data = await parseExcelOrCsv(selectedFile);
      const res = dbService.importSchools(data, actor);
      setResult(res);
      onSuccess();
    } catch (e: any) {
      setResult({
        added: 0,
        updated: 0,
        errors: [`Ralat pemprosesan fail: ${e.message}`],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Senarai Sekolah (Excel / CSV)"
      subtitle="Muat naik fail data sekolah secara pukal bagi Pejabat Pendidikan Daerah Tuaran"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Step 1: Download Template */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">Templat Rasmi Import Sekolah</p>
              <p className="text-[11px] text-blue-700">Format kolum: Kod, Nama, Kategori, Kod_Zon, Lat/Long, Radius</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            icon={<Download className="w-3.5 h-3.5" />}
            className="bg-white hover:bg-blue-50 text-blue-700 border-blue-300 shrink-0 font-semibold"
          >
            Muat Turun Templat
          </Button>
        </div>

        {/* Step 2: Upload File Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Fail CSV / Excel (.csv, .xlsx)
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer">
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : 'Klik untuk memilih fail atau seret fail ke sini'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Menyokong fail .csv, .xlsx sehingga 10MB</p>
            </label>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-1.5 ${
              result.errors.length > 0 && result.added === 0 && result.updated === 0
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {result.errors.length === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>Hasil Pemprosesan Fail:</span>
            </div>
            <p>
              Berjaya ditambah: <strong>{result.added}</strong> sekolah baharu | Dikemaskini:{' '}
              <strong>{result.updated}</strong> sekolah sedia ada.
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] text-rose-700">
                <p className="font-semibold">Catatan Ralat ({result.errors.length}):</p>
                <ul className="list-disc pl-4 space-y-0.5 mt-1">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedFile || isProcessing}
            isLoading={isProcessing}
            onClick={handleImport}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Mulakan Import
          </Button>
        </div>
      </div>
    </Modal>
  );
};

