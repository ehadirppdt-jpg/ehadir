import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { HolidayCalendarItem } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

export const CalendarAndRulesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [holidays, setHolidays] = useState<HolidayCalendarItem[]>(() =>
    dbService.getHolidays()
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('2026-05-01');
  const [type, setType] = useState<'NATIONAL' | 'STATE_SABAH' | 'SCHOOL_TERM' | 'SPECIAL'>('STATE_SABAH');
  const [appliesToPgb, setAppliesToPgb] = useState(true);
  const [description, setDescription] = useState('');

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      dbService.addHoliday(
        {
          name: name.trim(),
          holiday_date: date,
          type,
          applies_to_pgb: appliesToPgb,
          year: new Date(date).getFullYear(),
          description,
        },
        user
      );
      showToast(`Cuti ${name} berjaya ditambah.`, 'success');
      setHolidays(dbService.getHolidays());
      setIsModalOpen(false);
      setName('');
      setDescription('');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteHoliday = (h: HolidayCalendarItem) => {
    if (!user) return;
    if (confirm(`Padam cuti ${h.name} (${h.holiday_date})?`)) {
      dbService.deleteHoliday(h.id, user);
      showToast(`Cuti ${h.name} telah dipadam.`, 'success');
      setHolidays(dbService.getHolidays());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Kalendar Operasi & Cuti Rasmi PPD Tuaran
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penetapan hari bertugas, cuti kelepasan am persekutuan, cuti negeri Sabah, dan pengecualian cuti sekolah bagi PGB.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Tarikh Cuti
          </Button>
        )}
      </div>

      {/* Statutory Clarification Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Peraturan Perkhidmatan Pentadbir Sekolah (PGB):</strong>
          <p className="mt-0.5 text-blue-800">
            Cuti penggal persekolahan murid tidak secara automatik menjadi hari cuti rehat bagi Pengetua dan Guru Besar melainkan diwartakan atau mendapat kebenaran Pegawai Pendidikan Daerah. Jadual kalendar perkhidmatan ini diguna pakai untuk pengiraan hari bertugas sebenar.
          </p>
        </div>
      </div>

      {/* Holiday Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Senarai Cuti Rasmi Tahun 2026
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {holidays.length} Hari Cuti Didaftarkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Tarikh</th>
                <th className="px-4 py-3.5">Nama Hari Kelepasan</th>
                <th className="px-4 py-3.5">Jenis Cuti</th>
                <th className="px-4 py-3.5">Terpakai untuk PGB</th>
                <th className="px-4 py-3.5">Catatan</th>
                {isSuperAdmin && <th className="px-5 py-3.5 text-right">Tindakan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {h.holiday_date}
                  </td>

                  <td className="px-4 py-3.5 font-bold text-slate-800">{h.name}</td>

                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        h.type === 'STATE_SABAH'
                          ? 'purple'
                          : h.type === 'NATIONAL'
                          ? 'primary'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {h.type === 'STATE_SABAH'
                        ? 'Negeri Sabah'
                        : h.type === 'NATIONAL'
                        ? 'Persekutuan'
                        : h.type}
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Cuti PGB
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-500">{h.description || '-'}</td>

                  {isSuperAdmin && (
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteHoliday(h)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Padam Cuti"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Daftar Cuti Rasmi Baharu"
        subtitle="Tetapkan hari cuti umum atau cuti khas perkhidmatan"
        maxWidth="md"
      >
        <form onSubmit={handleAddHoliday} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Cuti</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hari Pekerja"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarikh Cuti</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Cuti</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="STATE_SABAH">Cuti Negeri Sabah</option>
                <option value="NATIONAL">Cuti Persekutuan / Kebangsaan</option>
                <option value="SPECIAL">Cuti Khas / Peristiwa</option>
                <option value="SCHOOL_TERM">Penggal Persekolahan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Warta cuti umum negeri Sabah..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Tambah Cuti
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

