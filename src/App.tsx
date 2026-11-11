import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Admin Modules
import { LoginPage } from '@/modules/auth/LoginPage';
import { AdminDashboard } from '@/modules/dashboard/AdminDashboard';
import { ZoneManagementPage } from '@/modules/zones/ZoneManagementPage';
import { SchoolManagementPage } from '@/modules/schools/SchoolManagementPage';
import { UserManagementPage } from '@/modules/users/UserManagementPage';
import { AdminManagementPage } from '@/modules/users/AdminManagementPage';
import { SchoolMapPage } from '@/modules/locations/SchoolMapPage';
import { GeofenceSettingsPage } from '@/modules/locations/GeofenceSettingsPage';
import { AttendanceMonitoringPage } from '@/modules/attendance/AttendanceMonitoringPage';
import { JustificationReviewPage } from '@/modules/attendance/JustificationReviewPage';
import { MonthlyVerificationPage } from '@/modules/verification/MonthlyVerificationPage';
import { ApproverAssignmentPage } from '@/modules/approver-assignments/ApproverAssignmentPage';
import { CalendarAndRulesPage } from '@/modules/system/CalendarAndRulesPage';
import { NotificationCentrePage } from '@/modules/system/NotificationCentrePage';
import { ReportsAnalyticsPage } from '@/modules/system/ReportsAnalyticsPage';
import { AuditLogsPage } from '@/modules/system/AuditLogsPage';
import { SystemSettingsPage } from '@/modules/system/SystemSettingsPage';
import { MyProfilePage } from '@/modules/profile/MyProfilePage';
import { ShieldAlert } from 'lucide-react';

// User Portal Modules
import { UserLayout } from '@/modules/user-portal/components/UserLayout';
import { UserDashboardPage } from '@/modules/user-portal/pages/UserDashboardPage';
import { UserCalendarPage } from '@/modules/user-portal/pages/UserCalendarPage';
import { UserAttendanceHistoryPage } from '@/modules/user-portal/pages/UserAttendanceHistoryPage';
import { UserJustificationsPage } from '@/modules/user-portal/pages/UserJustificationsPage';
import { UserMonthlyReportPage } from '@/modules/user-portal/pages/UserMonthlyReportPage';
import { UserProfilePage } from '@/modules/user-portal/pages/UserProfilePage';
import { UserNotificationsPage } from '@/modules/user-portal/pages/UserNotificationsPage';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading, portalMode, setPortalMode } = useAuth();
  const [adminPath, setAdminPath] = useState<string>('/admin/dashboard');
  const [userPath, setUserPath] = useState<string>('/user/dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg ring-4 ring-emerald-500/20 animate-pulse">
            eH
          </div>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Memuatkan e-HADIR TUARAN...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onSuccess={() => {
          if (portalMode === 'USER') {
            setUserPath('/user/dashboard');
          } else {
            setAdminPath('/admin/dashboard');
          }
        }}
      />
    );
  }

  // --------------------------------------------------------------------------
  // USER PORTAL (PGB)
  // --------------------------------------------------------------------------
  if (portalMode === 'USER' || user?.role === 'PGB') {
    const renderUserModule = () => {
      switch (userPath) {
        case '/user/dashboard':
          return <UserDashboardPage onNavigate={setUserPath} />;
        case '/user/calendar':
          return <UserCalendarPage onNavigate={setUserPath} />;
        case '/user/history':
          return <UserAttendanceHistoryPage />;
        case '/user/justifications':
          return <UserJustificationsPage />;
        case '/user/monthly-report':
          return <UserMonthlyReportPage />;
        case '/user/profile':
          return <UserProfilePage />;
        case '/user/notifications':
          return <UserNotificationsPage onNavigate={setUserPath} />;
        default:
          return <UserDashboardPage onNavigate={setUserPath} />;
      }
    };

    return (
      <UserLayout currentPath={userPath} onNavigate={setUserPath}>
        {renderUserModule()}
      </UserLayout>
    );
  }

  // --------------------------------------------------------------------------
  // ADMIN PORTAL
  // --------------------------------------------------------------------------
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isSuperAdminOnlyPath =
    adminPath === '/admin/admins' ||
    adminPath === '/admin/settings' ||
    adminPath === '/admin/approver-assignments';

  const renderAdminModule = () => {
    if (isSuperAdminOnlyPath && !isSuperAdmin) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-900">Akses Tidak Dibenarkan</h3>
          <p className="text-xs text-rose-700 mt-1.5 leading-relaxed">
            Halaman ini dikhaskan untuk <strong>Ketua Pentadbir (Head Admin)</strong> sahaja.
            Peranan anda ({user?.role}) tidak mempunyai kebenaran untuk mengakses modul ini.
          </p>
          <button
            onClick={() => setAdminPath('/admin/dashboard')}
            className="mt-5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Kembali ke Dashboard Pentadbiran
          </button>
        </div>
      );
    }

    switch (adminPath) {
      case '/admin/dashboard':
        return <AdminDashboard onNavigate={setAdminPath} />;
      case '/admin/zones':
        return <ZoneManagementPage />;
      case '/admin/schools':
        return (
          <SchoolManagementPage
            onNavigateToMap={(_id) => setAdminPath('/admin/locations/map')}
          />
        );
      case '/admin/users':
        return <UserManagementPage />;
      case '/admin/admins':
        return <AdminManagementPage />;
      case '/admin/locations/map':
        return <SchoolMapPage />;
      case '/admin/locations/geofence':
        return <GeofenceSettingsPage />;
      case '/admin/attendance/monitoring':
        return <AttendanceMonitoringPage />;
      case '/admin/attendance/justifications':
        return <JustificationReviewPage />;
      case '/admin/monthly-verification':
        return <MonthlyVerificationPage />;
      case '/admin/approver-assignments':
        return <ApproverAssignmentPage />;
      case '/admin/system/calendar':
        return <CalendarAndRulesPage />;
      case '/admin/notifications':
        return <NotificationCentrePage onNavigate={setAdminPath} />;
      case '/admin/reports':
        return <ReportsAnalyticsPage />;
      case '/admin/audit-logs':
        return <AuditLogsPage />;
      case '/admin/settings':
        return <SystemSettingsPage />;
      case '/admin/profile':
        return <MyProfilePage />;
      default:
        return <AdminDashboard onNavigate={setAdminPath} />;
    }
  };

  return (
    <AdminLayout currentPath={adminPath} onNavigate={setAdminPath}>
      {renderAdminModule()}
    </AdminLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
