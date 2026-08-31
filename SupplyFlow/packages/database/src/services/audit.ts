import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@supplyflow/database";

export interface AuditContext {
  organizationId: string;
  userId?: string | null;
  ip?: string;
  userAgent?: string;
}

export async function logAudit(ctx: AuditContext, action: string, entityType?: string, entityId?: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await getDb().insert(schema.auditLogs).values({
    organizationId: ctx.organizationId,
    userId: ctx.userId ?? null,
    action,
    entityType,
    entityId,
    metadata,
    ip: ctx.ip,
    userAgent: ctx.userAgent?.slice(0, 300)
  });
}

export async function logActivity(ctx: AuditContext, entityType: string, entityId: string, action: string, summary?: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await getDb().insert(schema.activities).values({
    organizationId: ctx.organizationId,
    entityType,
    entityId,
    actorId: ctx.userId ?? null,
    action,
    summary,
    metadata
  });
}

export async function notifyUsers(ctx: AuditContext, userIds: string[], type: string, title: string, body?: string, entityType?: string, entityId?: string): Promise<void> {
  if (userIds.length === 0) return;
  await getDb().insert(schema.notifications).values(
    userIds.map((userId) => ({
      organizationId: ctx.organizationId,
      userId,
      type,
      title,
      body,
      entityType,
      entityId
    }))
  );
}

export async function orgExists(organizationId: string): Promise<boolean> {
  const rows = await getDb().select({ id: schema.organizations.id }).from(schema.organizations).where(eq(schema.organizations.id, organizationId)).limit(1);
  return rows.length > 0;
}

export async function findMembership(organizationId: string, userId: string) {
  return (await getDb().select().from(schema.memberships).where(and(eq(schema.memberships.organizationId, organizationId), eq(schema.memberships.userId, userId))).limit(1))[0];
}
