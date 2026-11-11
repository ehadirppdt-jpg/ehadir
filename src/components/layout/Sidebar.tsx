import React from 'react';
import {
  LayoutDashboard,
  Layers,
  School as SchoolIcon,
  Users,
  ShieldAlert,
  MapPin,
  Compass,
  Clock,
  FileCheck2,
  CalendarCheck,
  UserCheck,
  Calendar,
  Bell,
  FileSpreadsheet,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();

  const handleNav = (path: string) => {
    onNavigate(path);
    setIsMobileOpen(false);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminZon = user?.role === 'ADMIN_ZON';
  const isMonitoring = user?.role === 'MONITORING_ADMIN';

  // Navigation Items
  const navSections = [
    {
      title: 'UTAMA',
      items: [
        {
          label: 'Dashboard Pentadbiran',
          path: '/admin/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          visible: true,
        },
      ],
    },
    {
      title: 'PENGURUSAN ORGANISASI',
      items: [
        {
          label: 'Pengurusan Zon',
          path: '/admin/zones',
          icon: <Layers className="w-4 h-4" />,
          visible: true,
        },
        {
          label: 'Pengurusan Sekolah',
          path: '/admin/schools',
          icon: <SchoolIcon className="w-4 h-4" />,
          visible: true,
        },
        {
          label: 'Pengurusan PGB',
          path: '/admin/users',
          icon: <Users className="w-4 h-4" />,
          visible: isSuperAdmin || isAdminZon || isMonitoring,
        },
        {
          label: 'Pengurusan Admin',
          path: '/admin/admins',
          icon: <ShieldAlert className="w-4 h-4" />,
          visible: isSuperAdmin,
        },
      ],
    },
    {
      title: 'LOKASI & GEOFENCE',
      items: [
        {
          label: 'Peta Sekolah',
          path: '/admin/locations/map',
          icon: <MapPin className="w-4 h-4" />,
          visible: true,
        },
        {
          label: 'Geofence Management',
          path: '/admin/locations/geofence',
          icon: <Compass className="w-4 h-4" />,
          visible: true,
        },
      ],
    },
    {
      title: 'KEHADIRAN & PENGESAHAN',
      items: [
        {
          label: 'Pemantauan Kehadiran',
          path: '/admin/attendance/monitoring',
          icon: <Clock className="w-4 h-4" />,
          visible: true,
        },
        {
          label: 'Semakan Justifikasi',
          path: '/admin/attendance/justifications',
          icon: <FileCheck2 className="w-4 h-4" />,
          visible: isSuperAdmin || isAdminZon,
        },
        {
          label: 'Pengesahan Bulanan',
          path: '/admin/monthly-verification',
          icon: <CalendarCheck className="w-4 h-4" />,
          badge: 'Bulan 10',
          visible: true,
        },
        {
          label: 'Penetapan Pegawai Pengesah',
          path: '/admin/approver-assignments',
          icon: <UserCheck className="w-4 h-4" />,
          visible: isSuperAdmin,
        },
      ],
    },
    {
      title: 'SISTEM & LAPORAN',
      items: [
        {
          label: 'Kalendar & Cuti',
          path: '/admin/system/calendar',
          icon: <Calendar className="w-4 h-4" />,
          visible: true,
        },
        {
          label: 'Notification Centre',
          path: '/admin/notifications',
          icon: <Bell className="w-4 h-4" />,
          visible: true,
        },
        {
          label: 'Reports & Analytics',
          path: '/admin/reports',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          visible: true,
        },
        {
          label: 'Audit Logs',
          path: '/admin/audit-logs',
          icon: <FileText className="w-4 h-4" />,
          visible: isSuperAdmin || isAdminZon,
        },
        {
          label: 'System Settings',
          path: '/admin/settings',
          icon: <Settings className="w-4 h-4" />,
          visible: isSuperAdmin,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-navy-900 text-slate-200 border-r border-navy-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-navy-800 flex items-center justify-between bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md font-bold text-lg ring-2 ring-blue-400/30">
              eH
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                e-HADIR TUARAN
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-semibold border border-blue-400/30">
                  ADMIN
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 truncate">PPD Tuaran • Sabah</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-navy-700">
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                  {section.title}
                </div>
                {visibleItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-navy-800 bg-navy-950">
          <div className="p-2.5 rounded-xl bg-navy-900 border border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 font-bold text-xs">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isSuperAdmin
                        ? 'bg-amber-400'
                        : isAdminZon
                        ? 'bg-emerald-400'
                        : 'bg-sky-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-300 font-medium">
                    {user?.role === 'SUPER_ADMIN'
                      ? 'Head Admin'
                      : user?.role === 'ADMIN_ZON'
                      ? 'Admin Zon'
                      : 'Monitoring'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log Keluar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

