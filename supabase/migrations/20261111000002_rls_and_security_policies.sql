-- ========================================================================
-- e-HADIR TUARAN — ROW LEVEL SECURITY (RLS) & SECURITY POLICIES
-- ========================================================================

-- Helper function: Get caller's active role code
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role_type AS $$
DECLARE
    v_role user_role_type;
BEGIN
    SELECT r.code INTO v_role
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    LIMIT 1;
    
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if caller is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() = 'SUPER_ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if caller is Monitoring Admin
CREATE OR REPLACE FUNCTION public.is_monitoring_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() = 'MONITORING_ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if caller is Admin Zon
CREATE OR REPLACE FUNCTION public.is_admin_zon()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() = 'ADMIN_ZON';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get zones assigned to current Admin Zon
CREATE OR REPLACE FUNCTION public.get_my_assigned_zone_ids()
RETURNS TABLE (zone_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT aza.zone_id 
    FROM public.admin_zone_assignments aza
    WHERE aza.admin_id = auth.uid() AND aza.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================
-- ENABLE RLS ON ALL TABLES
-- ========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_zone_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_school_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_zone_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_school_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_approver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_jobs ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- RLS POLICIES FOR PROFILES
-- ========================================================================
CREATE POLICY "Super admin has full control over profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_super_admin() OR public.is_monitoring_admin());

-- ========================================================================
-- RLS POLICIES FOR ZONES & SCHOOLS
-- ========================================================================
CREATE POLICY "Admins can view zones"
ON public.zones FOR SELECT
TO authenticated
USING (public.is_super_admin() OR public.is_admin_zon() OR public.is_monitoring_admin());

CREATE POLICY "Only super admin can modify zones"
ON public.zones FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin and monitoring admin can view all schools"
ON public.schools FOR SELECT
TO authenticated
USING (public.is_super_admin() OR public.is_monitoring_admin());

CREATE POLICY "Admin zon can view assigned schools only"
ON public.schools FOR SELECT
TO authenticated
USING (
    public.is_admin_zon() AND id IN (
        SELECT sza.school_id 
        FROM public.school_zone_assignments sza
        WHERE sza.zone_id IN (SELECT zone_id FROM public.get_my_assigned_zone_ids())
        AND sza.is_active = TRUE
    )
);

CREATE POLICY "Only super admin can insert or update schools"
ON public.schools FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- ========================================================================
-- RLS POLICIES FOR ATTENDANCE & VERIFICATION
-- ========================================================================
CREATE POLICY "Super admin and monitoring admin can view all attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (public.is_super_admin() OR public.is_monitoring_admin());

CREATE POLICY "Admin zon can view attendance of assigned schools only"
ON public.attendance_records FOR SELECT
TO authenticated
USING (
    public.is_admin_zon() AND school_id IN (
        SELECT sza.school_id 
        FROM public.school_zone_assignments sza
        WHERE sza.zone_id IN (SELECT zone_id FROM public.get_my_assigned_zone_ids())
        AND sza.is_active = TRUE
    )
);

CREATE POLICY "Super admin and assigned Admin Zon can verify monthly attendance"
ON public.monthly_approvals FOR INSERT
TO authenticated
WITH CHECK (
    public.is_super_admin() OR (
        public.is_admin_zon() AND approver_id = auth.uid()
    )
);

-- ========================================================================
-- RLS POLICIES FOR AUDIT LOGS (APPEND ONLY)
-- ========================================================================
CREATE POLICY "Super admin can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "Admin zon can view own audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin_zon() AND actor_id = auth.uid());

CREATE POLICY "System and admins can append audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- Prevent UPDATE & DELETE on audit_logs
CREATE POLICY "Audit logs cannot be updated"
ON public.audit_logs FOR UPDATE
TO authenticated
USING (FALSE);

CREATE POLICY "Audit logs cannot be deleted"
ON public.audit_logs FOR DELETE
TO authenticated
USING (FALSE);
