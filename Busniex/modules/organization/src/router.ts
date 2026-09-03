import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import { organizationUnitSchema, legalEntitySchema, locationSchema } from '@businex/validation';

/**
 * Organization module — the Universal Organization Model.
 *
 * Exposes the hierarchical org tree, legal entities and locations used by
 * every other module.
 */
export function organizationRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const identity = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c);
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => identity(c).tenantId;

  // --- Organization units ---
  app.get('/units', requirePermission('org:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db.select().from(tables.organizationUnit).where(eq(tables.organizationUnit.tenantId, tenantId));
    return c.json(rows);
  });

  app.post('/units', requirePermission('org:write'), async (c) => {
    const body = organizationUnitSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const [row] = await db
      .insert(tables.organizationUnit)
      .values({ ...body, tenantId })
      .returning();
    return c.json(row, 201);
  });

  // --- Legal entities ---
  app.get('/legal-entities', requirePermission('org:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db.select().from(tables.legalEntity).where(eq(tables.legalEntity.tenantId, tenantId));
    return c.json(rows);
  });

  app.post('/legal-entities', requirePermission('org:write'), async (c) => {
    const body = legalEntitySchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const [row] = await db
      .insert(tables.legalEntity)
      .values({ ...body, tenantId })
      .returning();
    return c.json(row, 201);
  });

  // --- Locations ---
  app.get('/locations', requirePermission('org:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db.select().from(tables.location).where(eq(tables.location.tenantId, tenantId));
    return c.json(rows);
  });

  app.post('/locations', requirePermission('org:write'), async (c) => {
    const body = locationSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const [row] = await db
      .insert(tables.location)
      .values({ ...body, tenantId })
      .returning();
    return c.json(row, 201);
  });

  // --- Org tree (computed) ---
  app.get('/tree', requirePermission('org:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db.select().from(tables.organizationUnit).where(eq(tables.organizationUnit.tenantId, tenantId));
    const byId = new Map(rows.map((r) => [r.id, r]));
    const build = (id: string): Record<string, unknown> | null => {
      const node = byId.get(id);
      if (!node) return null;
      const children = rows.filter((r) => r.parentId === id).map((r) => build(r.id));
      return { ...node, children };
    };
    const tree = rows.filter((r) => !r.parentId).map((r) => build(r.id));
    return c.json(tree);
  });

  return app;
}
