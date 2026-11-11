import React, { useState } from 'react';
import {
  Menu,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';
import { UserRoleType } from '@/types';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  onNavigate: (path: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu, onNavigate }) => {
  const { user, logout, switchRole } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications = dbService.getNotifications(user?.role);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    dbService.markAllNotificationsAsRead();
    setIsNotifOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Hamburger & District Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
            PPD Tuaran
          </span>
          <span className="text-xs text-slate-400 mx-2">•</span>
          <span className="text-xs font-medium text-slate-600">
            Sistem Pengurusan & Pengesahan Kehadiran PGB (85 Buah Sekolah)
          </span>
        </div>
      </div>

      {/* Right: Actions, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Portal Switcher to User Portal */}
        <button
          onClick={() => {
            switchRole('PGB');
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
          title="Beralih ke Portal Pengguna (PGB)"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          <span>Portal PGB</span>
        </button>

        {/* Official Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline text-slate-500 font-medium">Peranan:</span>
          <span className="text-blue-700 font-bold">
            {user?.role === 'SUPER_ADMIN'
              ? 'Super Admin'
              : user?.role === 'ADMIN_ZON'
              ? 'Admin Zon'
              : user?.role === 'PGB'
              ? 'Pengetua / Guru Besar'
              : 'Monitoring Admin'}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">Pusat Notifikasi</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} baharu
                    </span>
                  )}
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Tanda semua dibaca
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tiada notifikasi baharu
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        dbService.markNotificationAsRead(notif.id);
                        if (notif.link) onNavigate(notif.link);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.is_read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 leading-snug">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(notif.created_at).toLocaleTimeString('ms-MY', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <button
                  onClick={() => {
                    onNavigate('/admin/notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Lihat Semua Notifikasi →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-200">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  onNavigate('/admin/profile');
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profil Saya
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Log Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

