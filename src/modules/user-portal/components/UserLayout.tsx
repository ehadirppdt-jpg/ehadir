import React, { useState, ReactNode } from 'react';
import {
  Menu,
  Bell,
  X,
  LayoutDashboard,
  CalendarDays,
  FileText,
  Clock,
  User,
  LogOut,
  Shield,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  School,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/db';

interface UserLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const { user, logout, setPortalMode } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    {
      group: 'DASHBOARD',
      items: [
        {
          label: 'Dashboard Saya',
          path: '/user/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      group: 'KEHADIRAN',
      items: [
        {
          label: 'Kalendar Kehadiran',
          path: '/user/calendar',
          icon: <CalendarDays className="w-4 h-4" />,
        },
        {
          label: 'Sejarah Kehadiran',
          path: '/user/history',
          icon: <Clock className="w-4 h-4" />,
        },
      ],
    },
    {
      group: 'PENGURUSAN REKOD',
      items: [
        {
          label: 'Justifikasi Kehadiran',
          path: '/user/justifications',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: 'Laporan Bulanan',
          path: '/user/monthly-report',
          icon: <CheckCircle className="w-4 h-4" />,
        },
      ],
    },
    {
      group: 'SISTEM',
      items: [
        {
          label: 'Notifikasi',
          path: '/user/notifications',
          icon: <Bell className="w-4 h-4" />,
        },
        {
          label: 'Profil Saya',
          path: '/user/profile',
          icon: <User className="w-4 h-4" />,
        },
      ],
    },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header matching mockup */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        {/* Left hamburger button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Center Title */}
        <div className="text-center">
          <h1 className="text-base font-extrabold tracking-wider text-gray-900">
            e-HADIR TUARAN
          </h1>
        </div>

        {/* Right action area: Notifications and Portal Switcher */}
        <div className="flex items-center gap-1.5 -mr-1">
          {/* Quick Portal Switcher (For demo/evaluator) */}
          <button
            onClick={() => setPortalMode('ADMIN')}
            title="Tukar ke Portal Pentadbiran"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors mr-1"
          >
            <Shield className="w-3 h-3 text-blue-700" />
            Portal Admin
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => onNavigate('/user/notifications')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl relative transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          </button>
        </div>
      </header>

      {/* Slide-over Drawer Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-80 max-w-[85vw] bg-white border-r border-gray-200 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  {user?.full_name?.substring(0, 2).toUpperCase() || 'PG'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-gray-900 truncate max-w-[170px]">
                    {user?.full_name}
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-medium truncate max-w-[170px]">
                    {user?.school_name || 'Pengetua / Guru Besar'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {navItems.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                    {group.group}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentPath === item.path;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavClick(item.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <span className={isActive ? 'text-emerald-700' : 'text-gray-500'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Portal Pentadbiran Link */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setPortalMode('ADMIN');
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-blue-700" />
                    <span>Ke Portal Pentadbiran</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                </button>
              </div>
            </div>

            {/* Drawer Footer with Logout */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  logout();
                  setDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Keluar Portal PGB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar matching modern PWA standards */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden px-3 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onNavigate('/user/dashboard')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/dashboard' ? 'text-emerald-600 font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('/user/calendar')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/calendar' ? 'text-emerald-600 font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Kalendar</span>
          </button>

          <button
            onClick={() => onNavigate('/user/history')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/history' ? 'text-emerald-600 font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Sejarah</span>
          </button>

          <button
            onClick={() => onNavigate('/user/justifications')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/justifications' ? 'text-emerald-600 font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Justifikasi</span>
          </button>

          <button
            onClick={() => onNavigate('/user/profile')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/profile' ? 'text-emerald-600 font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
