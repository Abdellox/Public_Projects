import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors } from '@businex/lib';
import { requirePermission, getIdentity } from '@businex/auth';
import { partySchema, contactSchema } from '@businex/validation';

/**
 * Party module — the canonical counterparty model.
 *
 * One Party table stores every counterparty (customer, supplier, partner,
 * employee, lead, prospect). Roles are attached via party_role rather than
 * duplicated entities.
 */
export function partyRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c).tenantId;

  app.get('/', requirePermission('party:read'), async (c) => {
    const tenantId = tenantOf(c);
    const role = c.req.query('role');
    const where = eq(tables.party.tenantId, tenantId);
    let rows = await db.select().from(tables.party).where(where);
    if (role) {
      const roles = await db
        .select({ partyId: tables.partyRole.partyId })
        .from(tables.partyRole)
        .where(and(eq(tables.partyRole.tenantId, tenantId), eq(tables.partyRole.roleType, role)));
      const ids = new Set(roles.map((r) => r.partyId));
      rows = rows.filter((p) => ids.has(p.id));
    }
    return c.json(rows);
  });

  app.post('/', requirePermission('party:write'), async (c) => {
    const body = partySchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const [row] = await db
      .insert(tables.party)
      .values({
        tenantId,
        kind: body.kind,
        name: body.name,
        emails: (body.emails ?? []).map((address) => ({ address, isPrimary: false })),
        phones: (body.phones ?? []).map((number) => ({ number, isPrimary: false })),
        addresses: [],
      })
      .returning();
    return c.json(row, 201);
  });

  app.get('/:id', requirePermission('party:read'), async (c) => {
    const tenantId = tenantOf(c);
    const id = c.req.param('id')!;
    const [row] = await db
      .select()
      .from(tables.party)
      .where(and(eq(tables.party.id, id), eq(tables.party.tenantId, tenantId)));
    if (!row) throw Errors.notFound('Party not found');
    return c.json(row);
  });

  /** Assign a role to a party (customer, supplier, partner, employee...). */
  app.post('/:id/roles', requirePermission('party:write'), async (c) => {
    const tenantId = tenantOf(c);
    const id = c.req.param('id')!;
    const { roleType } = await c.req.json<{ roleType?: string }>();
    if (!roleType) throw Errors.badRequest('roleType is required');
    const [existing] = await db
      .select()
      .from(tables.partyRole)
      .where(
        and(eq(tables.partyRole.partyId, id), eq(tables.partyRole.roleType, roleType)),
      );
    if (existing) throw Errors.conflict('Party already has this role');
    const [row] = await db
      .insert(tables.partyRole)
      .values({ tenantId, partyId: id, roleType })
      .returning();
    return c.json(row, 201);
  });

  // --- Contacts ---
  app.post('/contacts', requirePermission('party:write'), async (c) => {
    const body = contactSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const [row] = await db
      .insert(tables.contact)
      .values({
        tenantId,
        partyId: body.partyId,
        organizationPartyId: body.organizationPartyId,
        firstName: body.firstName,
        lastName: body.lastName,
        title: body.title,
        emails: (body.emails ?? []).map((address) => ({ address, isPrimary: false })),
        phones: (body.phones ?? []).map((number) => ({ number, isPrimary: false })),
      })
      .returning();
    return c.json(row, 201);
  });

  return app;
}
