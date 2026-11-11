import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Modules
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
import { AttendanceRulesPage } from '@/modules/system/AttendanceRulesPage';
import { NotificationCentrePage } from '@/modules/system/NotificationCentrePage';
import { ReportsAnalyticsPage } from '@/modules/system/ReportsAnalyticsPage';
import { AuditLogsPage } from '@/modules/system/AuditLogsPage';
import { SystemSettingsPage } from '@/modules/system/SystemSettingsPage';
import { MyProfilePage } from '@/modules/profile/MyProfilePage';
import { ShieldAlert } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/admin/dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg ring-4 ring-blue-500/20 animate-pulse">
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
    return <LoginPage onSuccess={() => setCurrentPath('/admin/dashboard')} />;
  }

  // Access control validation for restricted pages
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isSuperAdminOnlyPath =
    currentPath === '/admin/admins' ||
    currentPath === '/admin/settings' ||
    currentPath === '/admin/approver-assignments';

  const renderModule = () => {
    if (isSuperAdminOnlyPath && !isSuperAdmin) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-900">Akses Tidak Dibenarkan</h3>
          <p className="text-xs text-rose-700 mt-1.5 leading-relaxed">
            Halaman ini dikhaskan untuk <strong>Ketua Pentadbir (Head Admin)</strong> sahaja. Peranan anda ({user?.role}) tidak mempunyai kebenaran untuk mengakses modul ini.
          </p>
          <button
            onClick={() => setCurrentPath('/admin/dashboard')}
            className="mt-5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Kembali ke Dashboard Pentadbiran
          </button>
        </div>
      );
    }

    switch (currentPath) {
      case '/admin/dashboard':
        return <AdminDashboard onNavigate={setCurrentPath} />;
      case '/admin/zones':
        return <ZoneManagementPage />;
      case '/admin/schools':
        return (
          <SchoolManagementPage
            onNavigateToMap={(_id) => setCurrentPath('/admin/locations/map')}
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
      case '/admin/system/rules':
        return <AttendanceRulesPage />;
      case '/admin/notifications':
        return <NotificationCentrePage onNavigate={setCurrentPath} />;
      case '/admin/reports':
        return <ReportsAnalyticsPage />;
      case '/admin/audit-logs':
        return <AuditLogsPage />;
      case '/admin/settings':
        return <SystemSettingsPage />;
      case '/admin/profile':
        return <MyProfilePage />;
      default:
        return <AdminDashboard onNavigate={setCurrentPath} />;
    }
  };

  return (
    <AdminLayout currentPath={currentPath} onNavigate={setCurrentPath}>
      {renderModule()}
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
