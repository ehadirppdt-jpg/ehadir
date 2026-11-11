import { AuditLog, UserRoleType } from '@/types';

const AUDIT_STORAGE_KEY = 'ehadir_tuaran_audit_logs';

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(AUDIT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse audit logs', e);
    return [];
  }
}

export function logAuditEvent(params: {
  actor_name: string;
  actor_role: UserRoleType;
  actor_id?: string;
  action: string;
  entity: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  remarks?: string;
}): AuditLog {
  const currentLogs = getStoredAuditLogs();
  const newLog: AuditLog = {
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    actor_id: params.actor_id || 'usr-super',
    actor_name: params.actor_name,
    actor_role: params.actor_role,
    action: params.action,
    entity: params.entity,
    record_id: params.record_id,
    old_values: params.old_values,
    new_values: params.new_values,
    ip_address: '10.12.144.52 (PPD Intranet)',
    remarks: params.remarks,
    created_at: new Date().toISOString(),
  };

  const updatedLogs = [newLog, ...currentLogs];
  // Keep last 1000 logs in local storage
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs.slice(0, 1000)));
  return newLog;
}

