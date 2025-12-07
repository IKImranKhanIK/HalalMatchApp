/**
 * Audit Logging Utility
 * Log admin actions for security and compliance
 */

import { createServerClient } from '@/lib/supabase/server';

export enum AuditAction {
  // Participant actions
  PARTICIPANT_CREATED = 'participant.created',
  PARTICIPANT_UPDATED = 'participant.updated',
  PARTICIPANT_DELETED = 'participant.deleted',
  PARTICIPANT_APPROVED = 'participant.approved',
  PARTICIPANT_REJECTED = 'participant.rejected',

  // Selection actions
  SELECTIONS_RESET = 'selections.reset',
  SELECTION_DELETED = 'selection.deleted',

  // Data actions
  DATABASE_RESET = 'database.reset',
  DATA_EXPORTED = 'data.exported',

  // Admin actions
  ADMIN_LOGIN = 'admin.login',
  ADMIN_LOGOUT = 'admin.logout',
}

export interface AuditLogEntry {
  action: AuditAction;
  actor_id: string;
  actor_email?: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createServerClient();
    const supabaseAny: any = supabase;

    await supabaseAny.from('audit_logs').insert({
      action: entry.action,
      actor_id: entry.actor_id,
      actor_email: entry.actor_email,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      details: entry.details,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log participant update
 */
export async function logParticipantUpdate(
  adminId: string,
  adminEmail: string,
  participantId: string,
  changes: Record<string, any>,
  request?: Request
): Promise<void> {
  await createAuditLog({
    action: AuditAction.PARTICIPANT_UPDATED,
    actor_id: adminId,
    actor_email: adminEmail,
    resource_type: 'participant',
    resource_id: participantId,
    details: { changes },
    ip_address: request ? getIpAddress(request) : undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
  });
}

/**
 * Log participant deletion
 */
export async function logParticipantDeletion(
  adminId: string,
  adminEmail: string,
  participantId: string,
  request?: Request
): Promise<void> {
  await createAuditLog({
    action: AuditAction.PARTICIPANT_DELETED,
    actor_id: adminId,
    actor_email: adminEmail,
    resource_type: 'participant',
    resource_id: participantId,
    ip_address: request ? getIpAddress(request) : undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
  });
}

/**
 * Log database reset
 */
export async function logDatabaseReset(
  adminId: string,
  adminEmail: string,
  resetType: 'selections' | 'all',
  request?: Request
): Promise<void> {
  await createAuditLog({
    action: resetType === 'selections' ? AuditAction.SELECTIONS_RESET : AuditAction.DATABASE_RESET,
    actor_id: adminId,
    actor_email: adminEmail,
    details: { reset_type: resetType },
    ip_address: request ? getIpAddress(request) : undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
  });
}

/**
 * Log data export
 */
export async function logDataExport(
  adminId: string,
  adminEmail: string,
  exportType: string,
  request?: Request
): Promise<void> {
  await createAuditLog({
    action: AuditAction.DATA_EXPORTED,
    actor_id: adminId,
    actor_email: adminEmail,
    details: { export_type: exportType },
    ip_address: request ? getIpAddress(request) : undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
  });
}

/**
 * Get IP address from request
 */
function getIpAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}
