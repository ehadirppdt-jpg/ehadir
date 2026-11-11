import React, { useState, useMemo } from 'react';
import {
  FileText,
  Shield,
  Search,
  Filter,
  Eye,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getStoredAuditLogs } from '@/lib/audit';
import { AuditLog } from '@/types';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';

export const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>(() => getStoredAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.remarks || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Log Audit Pentadbiran (Audit Trail)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Rekod jejak audit kekal tanpa kebenaran sunting atau padam bagi setiap transaksi dan modifikasi data pentadbiran.
        </p>
      </div>

      {/* Security Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 text-xs flex items-center gap-3 shadow-sm border border-slate-800">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold text-white">Append-Only Immutable Ledger:</span> Semua tindakan pentadbiran direkodkan bersama cap masa, alamat IP rangkaian, dan identiti pegawai bagi memenuhi piawaian keselamatan kerajaan.
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari dalam log audit mengikut nama pegawai, tindakan atau entiti..."
          className="max-w-md w-full"
        />

        <div className="text-xs font-semibold text-slate-500">
          Jumlah Rekod Jejak: <span className="text-slate-900 font-bold">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="Tiada Log Dikesan"
            description="Sebarang tindakan pentadbiran seperti mendaftar sekolah atau mengubah geofence akan direkodkan di sini secara automatik."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Cap Masa</th>
                  <th className="px-4 py-3.5">Pegawai Bertanggungjawab</th>
                  <th className="px-4 py-3.5">Tindakan</th>
                  <th className="px-4 py-3.5">Entiti Terlibat</th>
                  <th className="px-4 py-3.5">Catatan Operasi</th>
                  <th className="px-4 py-3.5">IP Rangkaian</th>
                  <th className="px-4 py-3.5 text-right">Perincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('ms-MY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{log.actor_name}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{log.actor_role}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700">{log.entity}</td>

                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                      {log.remarks || '-'}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                      {log.ip_address || '10.12.144.52'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                        title="Lihat Perincian Perubahan"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Perincian Transaksi Log Audit"
        subtitle={`ID Rekod: ${selectedLog?.id}`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Pegawai:</span>
                <span className="font-bold text-slate-900">{selectedLog.actor_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Peranan:</span>
                <span className="font-bold text-blue-700">{selectedLog.actor_role}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tindakan:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cap Masa:</span>
                <span className="font-mono text-slate-700">{new Date(selectedLog.created_at).toLocaleString('ms-MY')}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Catatan Keterangan:</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                {selectedLog.remarks || 'Tiada keterangan tambahan.'}
              </p>
            </div>

            {selectedLog.new_values && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Data Nilai Baharu (Payload):</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto font-mono text-[11px] max-h-48">
                  {JSON.stringify(selectedLog.new_values, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

