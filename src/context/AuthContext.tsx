import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRoleType } from '@/types';
import { dbService } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type PortalModeType = 'ADMIN' | 'USER';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  portalMode: PortalModeType;
  setPortalMode: (mode: PortalModeType) => void;
  login: (
    email: string,
    password?: string,
    portal?: PortalModeType
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRoleType) => void;
  switchUser: (userId: string) => void;
  hasRole: (roles: UserRoleType[]) => boolean;
  canAccessZone: (zoneId: string) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ehadir_tuaran_auth_session';
const PORTAL_STORAGE_KEY = 'ehadir_tuaran_portal_mode';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [portalMode, setPortalModeState] = useState<PortalModeType>('ADMIN');

  const setPortalMode = (mode: PortalModeType) => {
    setPortalModeState(mode);
    localStorage.setItem(PORTAL_STORAGE_KEY, mode);
  };

  // Restore session
  useEffect(() => {
    try {
      const storedPortal = localStorage.getItem(PORTAL_STORAGE_KEY) as PortalModeType | null;
      if (storedPortal === 'ADMIN' || storedPortal === 'USER') {
        setPortalModeState(storedPortal);
      }

      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const freshUsers = dbService.getUsers();
        let matched = freshUsers.find(
          (u) => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase()
        );

        if (!matched && parsed && parsed.status === 'ACTIVE') {
          dbService.saveUser(parsed);
          matched = parsed;
        }

        if (matched && matched.status === 'ACTIVE') {
          setUser(matched);
          if (matched.role === 'PGB') {
            setPortalModeState('USER');
          }
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Session restoration failed', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password?: string,
    targetPortal?: PortalModeType
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanEmail = email.trim().toLowerCase();

    // If Supabase is configured and password is provided, attempt live Supabase Auth
    if (isSupabaseConfigured && password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authData?.user && !authError) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          let userProfile: UserProfile;

          if (profile) {
            userProfile = {
              id: profile.id,
              full_name: profile.full_name || 'Pentadbir',
              ic_no: profile.ic_no || '',
              position: profile.position || 'Pegawai Perkhidmatan Pendidikan',
              email: profile.email || cleanEmail,
              phone_number: profile.phone_number,
              avatar_url: profile.avatar_url,
              status: profile.status || 'ACTIVE',
              role: (profile.role as UserRoleType) || 'SUPER_ADMIN',
              assigned_zone_ids: profile.assigned_zone_ids,
              assigned_school_id: profile.assigned_school_id,
              school_name: profile.school_name,
              created_at: profile.created_at || new Date().toISOString(),
              updated_at: profile.updated_at || new Date().toISOString(),
            };
          } else {
            // First time login for user entered manually into Supabase Authentication:
            // Auto-provision Super Admin profile
            userProfile = {
              id: authData.user.id,
              full_name:
                (authData.user.user_metadata?.full_name as string) ||
                cleanEmail.split('@')[0].toUpperCase() ||
                'SUPER ADMIN PPD TUARAN',
              ic_no: (authData.user.user_metadata?.ic_no as string) || '710412125587',
              position:
                (authData.user.user_metadata?.position as string) ||
                'Pegawai Pendidikan Daerah / Head Admin',
              email: authData.user.email || cleanEmail,
              status: 'ACTIVE',
              role: (authData.user.user_metadata?.role as UserRoleType) || 'SUPER_ADMIN',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            try {
              await supabase.from('profiles').upsert([userProfile]);
            } catch (pErr) {
              console.warn('Could not upsert profile into Supabase:', pErr);
            }
          }

          // Cache profile locally in dbService
          dbService.saveUser(userProfile);

          // Role check against target portal
          const currentPortal = targetPortal || portalMode;
          if (currentPortal === 'ADMIN' && userProfile.role === 'PGB') {
            setIsLoading(false);
            return {
              success: false,
              error: 'Akaun Pengetua / Guru Besar (PGB) perlu menggunakan Portal Pengguna e-HADIR TUARAN.',
            };
          }

          setUser(userProfile);
          if (userProfile.role === 'PGB') {
            setPortalMode('USER');
          } else {
            setPortalMode('ADMIN');
          }
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));

          logAuditEvent({
            actor_name: userProfile.full_name,
            actor_role: userProfile.role,
            actor_id: userProfile.id,
            action: 'LOG_MASUK',
            entity: 'AUTENTIKASI',
            remarks: `Log masuk berjaya melalui akaun Supabase (${userProfile.email}) sebagai ${userProfile.role}.`,
          });

          setIsLoading(false);
          return { success: true };
        } else if (authError) {
          console.warn('Supabase auth notice:', authError.message);
        }
      } catch (err) {
        console.warn('Supabase auth attempt returned:', err);
      }
    }

    const users = dbService.getUsers();
    const matched = users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.id.toLowerCase() === cleanEmail
    );

    if (!matched) {
      setIsLoading(false);
      return {
        success: false,
        error:
          'Emel atau kata laluan tidak sah. Sila pastikan akaun telah didaftarkan dalam Supabase atau dicipta oleh Super Admin.',
      };
    }

    // Role check depending on portal target
    const currentPortal = targetPortal || portalMode;
    if (currentPortal === 'ADMIN' && matched.role === 'PGB') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Akaun Pengetua / Guru Besar (PGB) perlu menggunakan Portal Pengguna e-HADIR TUARAN.',
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
    if (matched.role === 'PGB') {
      setPortalMode('USER');
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));

    logAuditEvent({
      actor_name: matched.full_name,
      actor_role: matched.role,
      actor_id: matched.id,
      action: 'LOG_MASUK',
      entity: 'AUTENTIKASI',
      remarks: `Log masuk berjaya ke Portal ${matched.role === 'PGB' ? 'Pengguna PGB' : 'Pentadbiran'} sebagai ${matched.role}.`,
    });

    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
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
      if (targetUser.role === 'PGB') {
        setPortalMode('USER');
      } else {
        setPortalMode('ADMIN');
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
    }
  };

  const switchUser = (userId: string) => {
    const users = dbService.getUsers();
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setUser(targetUser);
      if (targetUser.role === 'PGB') {
        setPortalMode('USER');
      }
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
        portalMode,
        setPortalMode,
        login,
        logout,
        switchRole,
        switchUser,
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
