import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { getIdentity, requirePermission } from '@businex/auth';
import { auditLogSchema } from '@businex/validation';
import type { ModuleDescriptor } from '@businex/types';

export interface AuditInput {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  organizationId?: string;
  legalEntityId?: string;
  source?: string;
  ipAddress?: string;
}

/** Reusable audit writer used by any module to record a protected operation. */
export async function writeAudit(db: BusinexDb, tenantId: string, input: AuditInput) {
  const [row] = await db
    .insert(tables.auditLog)
    .values({
      tenantId,
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      previousValue: input.previousValue,
      newValue: input.newValue,
      organizationId: input.organizationId,
      legalEntityId: input.legalEntityId,
      source: input.source,
      ipAddress: input.ipAddress,
    })
    .returning();
  return row;
}

export function auditRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c).tenantId;

  app.get('/', requirePermission('audit:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.auditLog)
      .where(eq(tables.auditLog.tenantId, tenantId))
      .orderBy(desc(tables.auditLog.at))
      .limit(200);
    return c.json(rows);
  });

  // Manual audit entry (e.g. for external/imported operations).
  app.post('/', requirePermission('audit:write'), async (c) => {
    const body = auditLogSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const identity = getIdentity(c);
    const row = await writeAudit(db, tenantId, {
      actorUserId: identity.userId,
      action: body.action,
      entityType: body.entityType,
      entityId: body.entityId,
      previousValue: body.previousValue,
      newValue: body.newValue,
    });
    return c.json(row, 201);
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/audit', auditRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'audit',
  name: 'Audit',
  description: 'Immutable audit trail of who changed what, when, and in which scope.',
  group: 'enterprise',
  permissions: ['audit:read', 'audit:write'],
  enabled: true,
};
