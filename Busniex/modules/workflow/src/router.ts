import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import type { WorkflowStatus, WorkflowTransition } from '@businex/types';

/**
 * Universal Workflow Engine.
 *
 * A workflow definition lists transitions for a document type. Small
 * businesses and enterprises both use the same engine; only the configured
 * chains differ. Approvals pause a workflow until each required approver
 * decides.
 */
export function workflowRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c).tenantId;

  // --- Definitions ---
  app.get('/definitions', requirePermission('workflow:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.workflowDefinition)
      .where(eq(tables.workflowDefinition.tenantId, tenantId));
    return c.json(rows);
  });

  app.post('/definitions', requirePermission('workflow:write'), async (c) => {
    const body = await c.req.json<{
      name: string;
      appliesTo: string;
      transitions: WorkflowTransition[];
    }>();
    const [row] = await db
      .insert(tables.workflowDefinition)
      .values({ ...body, tenantId: tenantOf(c), transitions: body.transitions as unknown[] })
      .returning();
    return c.json(row, 201);
  });

  /** Post a transition on a document's workflow instance. */
  app.post('/transition', requirePermission('workflow:write'), async (c) => {
    const tenantId = tenantOf(c);
    const { documentType, documentId, to, note } = await c.req.json<{
      documentType?: string;
      documentId?: string;
      to?: WorkflowStatus;
      note?: string;
    }>();
    if (!documentType || !documentId || !to) {
      throw Errors.badRequest('documentType, documentId and to are required');
    }

    const [instance] = await db
      .select()
      .from(tables.workflowInstance)
      .where(
        and(
          eq(tables.workflowInstance.tenantId, tenantId),
          eq(tables.workflowInstance.documentType, documentType),
          eq(tables.workflowInstance.documentId, documentId),
        ),
      );

    const def = instance
      ? (instance.workflowDefinitionId
          ? await db
              .select()
              .from(tables.workflowDefinition)
              .where(eq(tables.workflowDefinition.id, instance.workflowDefinitionId))
              .then((r) => r[0])
          : undefined)
      : await db
          .select()
          .from(tables.workflowDefinition)
          .where(
            and(
              eq(tables.workflowDefinition.tenantId, tenantId),
              eq(tables.workflowDefinition.appliesTo, documentType),
            ),
          )
          .then((r) => r[0]);

    if (!def) throw Errors.notFound(`No workflow definition for ${documentType}`);

    const allowed = (def.transitions as WorkflowTransition[]).some(
      (t) => t.from === (instance?.status ?? 'draft') && t.to === to,
    );
    if (!allowed) {
      throw Errors.badRequest(
        `Transition from ${instance?.status ?? 'draft'} to ${to} is not allowed`,
      );
    }

    const history = ((instance?.history as unknown[]) ?? []).concat([
      {
        id: crypto.randomUUID(),
        from: instance?.status ?? 'draft',
        to,
        actorUserId: getIdentity(c).userId,
        note,
        at: new Date().toISOString(),
      },
    ]);

    const result = instance
      ? await db
          .update(tables.workflowInstance)
          .set({ status: to, history: history as unknown[], updatedAt: new Date() })
          .where(eq(tables.workflowInstance.id, instance.id))
          .returning()
      : await db
          .insert(tables.workflowInstance)
          .values({
            tenantId,
            workflowDefinitionId: def.id,
            documentType,
            documentId,
            status: to,
            history: history as unknown[],
          })
          .returning();

    return c.json(result[0]);
  });

  return app;
}
