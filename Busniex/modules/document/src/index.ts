import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import type { ModuleDescriptor } from '@businex/types';

/**
 * Centralized Document system. A document is attached to any entity
 * (invoice, contract, order, employee...) and reused across modules.
 */
export function documentRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c).tenantId;

  app.get('/', requirePermission('document:read'), async (c) => {
    const tenantId = tenantOf(c);
    const refType = c.req.query('entityType');
    const refId = c.req.query('entityId');
    const conditions = [eq(tables.document.tenantId, tenantId)];
    if (refType && refId) {
      conditions.push(
        eq(tables.document.refEntityType, refType),
        eq(tables.document.refEntityId, refId),
      );
    }
    const rows = await db
      .select()
      .from(tables.document)
      .where(and(...conditions));
    return c.json(rows);
  });

  app.post('/', requirePermission('document:write'), async (c) => {
    const body = await c.req.json<{
      docType: string;
      title: string;
      entityType: string;
      entityId: string;
      retentionDays?: number;
    }>();
    const tenantId = tenantOf(c);
    const [row] = await db
      .insert(tables.document)
      .values({
        tenantId,
        docType: body.docType,
        title: body.title,
        refEntityType: body.entityType,
        refEntityId: body.entityId,
        retentionDays: body.retentionDays,
      })
      .returning();
    return c.json(row, 201);
  });

  app.get('/:id', requirePermission('document:read'), async (c) => {
    const tenantId = tenantOf(c);
    const id = c.req.param('id')!;
    const [doc] = await db
      .select()
      .from(tables.document)
      .where(and(eq(tables.document.id, id), eq(tables.document.tenantId, tenantId)));
    if (!doc) throw Errors.notFound('Document not found');
    const files = await db
      .select()
      .from(tables.fileRef)
      .where(eq(tables.fileRef.documentId, doc.id));
    return c.json({ ...doc, files });
  });

  // Register a file against a document.
  app.post('/:id/files', requirePermission('document:write'), async (c) => {
    const tenantId = tenantOf(c);
    const id = c.req.param('id')!;
    const body = await c.req.json<{ name: string; mimeType: string; sizeBytes: number; storageKey: string }>();
    const [file] = await db
      .insert(tables.fileRef)
      .values({
        tenantId,
        documentId: id,
        name: body.name,
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes,
        storageKey: body.storageKey,
        uploadedById: getIdentity(c).userId,
      })
      .returning();
    return c.json(file, 201);
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/documents', documentRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'document',
  name: 'Documents',
  description: 'Centralized document & file management reusable across every module.',
  group: 'enterprise',
  permissions: ['document:read', 'document:write'],
  enabled: true,
};
