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
  Smartphone,
  LogOut,
  Shield,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  School,
  ExternalLink,
  Users,
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
  const { user, logout, setPortalMode, switchUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickSwitchOpen, setQuickSwitchOpen] = useState(false);

  // Available PGB users for quick testing across all 6 zones
  const allUsers = dbService.getUsers();
  const pgbUsers = allUsers.filter((u) => u.role === 'PGB');

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
      group: 'SISTEM & PERANTI',
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
        {
          label: 'Pengurusan Peranti',
          path: '/user/devices',
          icon: <Smartphone className="w-4 h-4" />,
        },
      ],
    },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header matching mockup */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        {/* Left hamburger button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Center Title */}
        <div className="text-center">
          <h1 className="text-base font-extrabold tracking-wider text-white">
            e-HADIR TUARAN
          </h1>
        </div>

        {/* Right action area: Notifications and Portal Switcher */}
        <div className="flex items-center gap-1.5 -mr-1">
          {/* Quick Portal Switcher (For demo/evaluator) */}
          <button
            onClick={() => setPortalMode('ADMIN')}
            title="Tukar ke Portal Pentadbiran"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 transition-colors mr-1"
          >
            <Shield className="w-3 h-3 text-blue-400" />
            Portal Admin
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => onNavigate('/user/notifications')}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl relative transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
          </button>
        </div>
      </header>

      {/* Slide-over Drawer Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  {user?.full_name?.substring(0, 2).toUpperCase() || 'PG'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-white truncate max-w-[170px]">
                    {user?.full_name}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium truncate max-w-[170px]">
                    {user?.school_name || 'Pengetua / Guru Besar'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Switcher Selector */}
            <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  Tukar Akaun PGB (Demo)
                </span>
                <button
                  onClick={() => setQuickSwitchOpen(!quickSwitchOpen)}
                  className="text-[10px] text-emerald-400 hover:underline font-semibold"
                >
                  {quickSwitchOpen ? 'Tutup' : 'Pilih'}
                </button>
              </div>

              {quickSwitchOpen && (
                <div className="space-y-1 mt-2 max-h-40 overflow-y-auto pr-1">
                  {pgbUsers.map((pgb) => (
                    <button
                      key={pgb.id}
                      onClick={() => {
                        switchUser(pgb.id);
                        setQuickSwitchOpen(false);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                        user?.id === pgb.id
                          ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-semibold">{pgb.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{pgb.school_name}</p>
                      </div>
                      {user?.id === pgb.id && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {navItems.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
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
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
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
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setPortalMode('ADMIN');
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-blue-400 bg-blue-950/40 border border-blue-900/50 hover:bg-blue-900/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Ke Portal Pentadbiran</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            </div>

            {/* Drawer Footer with Logout */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60">
              <button
                onClick={() => {
                  logout();
                  setDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-900/60 text-rose-300 rounded-xl text-xs font-bold transition-colors"
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 md:hidden px-3 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onNavigate('/user/dashboard')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('/user/calendar')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/calendar' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Kalendar</span>
          </button>

          <button
            onClick={() => onNavigate('/user/history')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/history' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Sejarah</span>
          </button>

          <button
            onClick={() => onNavigate('/user/justifications')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/justifications' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Justifikasi</span>
          </button>

          <button
            onClick={() => onNavigate('/user/profile')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentPath === '/user/profile' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
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

