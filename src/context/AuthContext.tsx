import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRoleType } from '@/types';
import { dbService } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRoleType) => void;
  hasRole: (roles: UserRoleType[]) => boolean;
  canAccessZone: (zoneId: string) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ehadir_tuaran_auth_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Refresh with latest db data
        const freshUsers = dbService.getUsers();
        const matched = freshUsers.find((u) => u.id === parsed.id);
        if (matched && matched.status === 'ACTIVE' && matched.role !== 'PGB') {
          setUser(matched);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        // Default initial session: Head Admin (Super Admin) for immediate access
        const defaultAdmin = dbService.getUsers().find((u) => u.role === 'SUPER_ADMIN');
        if (defaultAdmin) {
          setUser(defaultAdmin);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAdmin));
        }
      }
    } catch (e) {
      console.error('Session restoration failed', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Smooth auth latency simulation

    const users = dbService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Emel atau kata laluan tidak sah. Sila semak semula kredensial anda.',
      };
    }

    // Role check: PGB accounts are strictly prohibited from Admin Portal
    if (matched.role === 'PGB') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Akaun Pengetua / Guru Besar (PGB) tidak dibenarkan mengakses Portal Pentadbiran ini.',
      };
    }

    // Account status check
    if (matched.status !== 'ACTIVE') {
      setIsLoading(false);
      return {
        success: false,
        error: `Akaun anda telah berstatus ${matched.status}. Sila hubungi Super Admin PPD Tuaran untuk pengaktifan semula.`,
      };
    }

    setUser(matched);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));

    logAuditEvent({
      actor_name: matched.full_name,
      actor_role: matched.role,
      actor_id: matched.id,
      action: 'LOG_MASUK',
      entity: 'AUTENTIKASI',
      remarks: `Log masuk berjaya ke Portal Pentadbiran sebagai ${matched.role}.`,
    });

    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      logAuditEvent({
        actor_name: user.full_name,
        actor_role: user.role,
        actor_id: user.id,
        action: 'LOG_KELUAR',
        entity: 'AUTENTIKASI',
        remarks: 'Pengguna mendaftar keluar daripada sesi portal.',
      });
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Helper for developers and reviewers to quickly test permission boundaries
  const switchRole = (role: UserRoleType) => {
    const users = dbService.getUsers();
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
    }
  };

  const hasRole = (roles: UserRoleType[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccessZone = (zoneId: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'MONITORING_ADMIN') return true;
    if (user.role === 'ADMIN_ZON') {
      return (user.assigned_zone_ids || []).includes(zoneId);
    }
    return false;
  };

  const canAccessSchool = (schoolId: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'MONITORING_ADMIN') return true;
    if (user.role === 'ADMIN_ZON') {
      const schools = dbService.getSchools();
      const school = schools.find((s) => s.id === schoolId);
      if (!school || !school.zone_id) return false;
      return (user.assigned_zone_ids || []).includes(school.zone_id);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
        hasRole,
        canAccessZone,
        canAccessSchool,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

