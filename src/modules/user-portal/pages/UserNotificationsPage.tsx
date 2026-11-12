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
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pusat Notifikasi & Peringatan
          </h2>
          <p className="text-xs text-slate-400">
            Makluman rasmi kehadiran, status verifikasi bulanan dan tindakan pengesahan.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors self-start sm:self-auto"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          Tanda Semua Telah Dibaca
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-10 text-center bg-[#0b1322] rounded-2xl border border-slate-800 text-slate-400">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-slate-300">Tiada Notifikasi Baharu</h4>
            <p className="text-xs text-slate-500 mt-1">Anda tidak mempunyai sebarang makluman tertunggak.</p>
          </div>
        ) : (
          notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNotificationClick(item)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              item.isRead
                ? 'bg-[#0b1322] border-slate-800 hover:border-slate-700'
                : 'bg-[#0e1a2f] border-sky-500/40 hover:border-sky-400 shadow-md'
            }`}
          >
            {/* Icon by Type */}
            <div className="mt-0.5 shrink-0">
              {item.type === 'SUCCESS' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {item.type === 'WARNING' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {item.type === 'INFO' && (
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold ${
                    item.isRead ? 'text-slate-200' : 'text-white'
                  }`}
                >
                  {item.title}
                </h4>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleDateString('ms-MY', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600 self-center shrink-0" />
          </div>
        ))
        )}
      </div>
    </div>
  );
};

