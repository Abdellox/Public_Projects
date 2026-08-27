import type { Database } from '@nexora/database';
import { auditLogs } from '@nexora/database';

export interface AuditEntry {
  organizationId?: string | null;
  actorUserId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

const SENSITIVE_KEYS = new Set(['password', 'token', 'passwordhash']);

function redact(metadata: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      out[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object') {
      out[key] = redact(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Fire-and-forget audit write — never breaks the request path. */
export async function writeAudit(db: Database, entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      organizationId: entry.organizationId ?? null,
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ? redact(entry.metadata) : {},
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
    });
  } catch (err) {
    console.error('[audit] write failed:', err);
  }
}
