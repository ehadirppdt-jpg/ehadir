import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Check,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';

interface UserNotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const UserNotificationsPage: React.FC<UserNotificationsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>(() => {
    if (!user) return [];
    const appNotifs = dbService.getNotifications(user.role, user.id);
    return appNotifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      timestamp: n.created_at,
      type: n.category === 'JUSTIFICATION' || n.category === 'GEOFENCE_ALERT' ? 'WARNING' : 'INFO',
      isRead: n.is_read,
      link: n.link || '/user/dashboard',
    }));
  });

  if (!user) return null;

  const handleMarkAllRead = () => {
    dbService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (item.link) {
      onNavigate(item.link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Pusat Notifikasi &amp; Peringatan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Makluman rasmi kehadiran, status verifikasi bulanan dan tindakan pengesahan.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          Tanda Semua Telah Dibaca
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-700">Tiada Notifikasi Baharu</h4>
            <p className="text-xs text-gray-400 mt-1">Anda tidak mempunyai sebarang makluman tertunggak.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                item.isRead
                  ? 'bg-white border-gray-200 hover:border-gray-300'
                  : 'bg-blue-50 border-blue-200 hover:border-blue-400 shadow-sm'
              }`}
            >
              {/* Icon by Type */}
              <div className="mt-0.5 shrink-0">
                {item.type === 'SUCCESS' && (
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {item.type === 'WARNING' && (
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                {item.type === 'INFO' && (
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold ${
                      item.isRead ? 'text-gray-700' : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString('ms-MY', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.message}</p>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 self-center shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
