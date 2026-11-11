import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Smartphone,
  ScanFace,
  Compass,
  School,
  Check,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { AppNotification } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';

interface NotificationCentrePageProps {
  onNavigate?: (path: string) => void;
}

export const NotificationCentrePage: React.FC<NotificationCentrePageProps> = ({
  onNavigate,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    dbService.getNotifications(user?.role)
  );

  const refreshNotifs = () => {
    setNotifications(dbService.getNotifications(user?.role));
  };

  const handleMarkRead = (id: string) => {
    dbService.markNotificationAsRead(id);
    refreshNotifs();
  };

  const handleMarkAllRead = () => {
    dbService.markAllNotificationsAsRead();
    showToast('Semua notifikasi ditandakan sebagai telah dibaca.', 'success');
    refreshNotifs();
  };

  const filteredNotifs = useMemo(() => {
    return notifications.filter((n) => {
      if (categoryFilter === 'ALL') return true;
      if (categoryFilter === 'UNREAD') return !n.is_read;
      return n.category === categoryFilter;
    });
  }, [notifications, categoryFilter]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MONTHLY_SUBMISSION':
      case 'PENDING_VERIFICATION':
        return <FileCheck2 className="w-4 h-4 text-blue-600" />;
      case 'DEVICE_REQUEST':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'FACE_ENROLMENT':
        return <ScanFace className="w-4 h-4 text-teal-600" />;
      case 'GEOFENCE_ALERT':
        return <Compass className="w-4 h-4 text-rose-600" />;
      case 'UNASSIGNED_SCHOOL':
        return <School className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Pusat Notifikasi Pentadbiran (Notification Centre)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Makluman segera mengenai penyerahan laporan bulanan, rayuan justifikasi, dan status operasi sekolah.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          icon={<Check className="w-4 h-4" />}
        >
          Tanda Semua Dibaca
        </Button>
      </div>

      {/* Category Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            categoryFilter === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600 font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua ({notifications.length})
        </button>

        <button
          onClick={() => setCategoryFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            categoryFilter === 'UNREAD'
              ? 'bg-rose-600 text-white border-rose-600 font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Belum Dibaca ({notifications.filter((n) => !n.is_read).length})
        </button>

        <button
          onClick={() => setCategoryFilter('UNASSIGNED_SCHOOL')}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            categoryFilter === 'UNASSIGNED_SCHOOL'
              ? 'bg-amber-600 text-white border-amber-600 font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Sekolah Tanpa Pengesah
        </button>

        <button
          onClick={() => setCategoryFilter('MONTHLY_SUBMISSION')}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            categoryFilter === 'MONTHLY_SUBMISSION'
              ? 'bg-blue-600 text-white border-blue-600 font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Penyerahan Bulanan
        </button>

        <button
          onClick={() => setCategoryFilter('DEVICE_REQUEST')}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            categoryFilter === 'DEVICE_REQUEST'
              ? 'bg-purple-600 text-white border-purple-600 font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Pertukaran Peranti
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <EmptyState
            title="Tiada Notifikasi"
            description="Semua makluman sistem telah dibaca atau tiada rekod dalam kategori ini."
          />
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !item.is_read ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {new Date(item.created_at).toLocaleString('ms-MY', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.link && onNavigate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleMarkRead(item.id);
                      onNavigate(item.link!);
                    }}
                  >
                    Buka Tindakan
                  </Button>
                )}

                {!item.is_read && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                    title="Tanda telah dibaca"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

