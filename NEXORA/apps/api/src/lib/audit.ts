import type { FastifyRequest } from "fastify";
import type { Db } from "@nexora/database";
import { auditLogs } from "@nexora/database";
import { PERMISSIONS } from "@nexora/types";

export interface AuditInput {
  organizationId?: string | null;
  actorUserId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  request?: FastifyRequest | null;
}

/**
 * Append-only audit trail writer. Never throws into the request path —
 * a failed audit write is logged loudly but does not break the operation
 * it observed.
 */
export async function audit(db: Db, input: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      organizationId: input.organizationId ?? null,
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? {},
      ip: input.request?.ip ?? null,
      userAgent: input.request?.headers["user-agent"]?.slice(0, 400) ?? null
    });
  } catch (err) {
    input.request?.log.error({ err, action: input.action }, "audit_write_failed");
  }
}

/** Exported so tests can assert the catalog and defaults never drift apart. */
export const AUDITABLE_PERMISSIONS = Object.keys(PERMISSIONS);
