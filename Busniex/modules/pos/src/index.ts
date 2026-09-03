import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors, nextNumber, sumMoney } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import { posOrderSchema } from '@businex/validation';
import { writeAudit } from '@businex/module-audit';
import type { ModuleDescriptor } from '@businex/types';

/**
 * POS module — point of sale orders.
 *
 * Reuses the canonical Product catalog, Party customer and location for the
 * register. A POS order completes immediately (a simple workflow) and can feed
 * inventory and invoicing.
 */
export function posRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const identity = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c);
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => identity(c).tenantId;

  app.get('/orders', requirePermission('order:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.posOrder)
      .where(eq(tables.posOrder.tenantId, tenantId))
      .orderBy(desc(tables.posOrder.createdAt));
    return c.json(rows);
  });

  app.post('/orders', requirePermission('order:write'), async (c) => {
    const body = posOrderSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const me = identity(c);
    const total = sumMoney(body.lineItems.map((l) => l.quantity * l.unitPrice));
    const count = await db
      .select({ n: tables.posOrder.id })
      .from(tables.posOrder)
      .where(eq(tables.posOrder.tenantId, tenantId))
      .then((r) => r.length);

    const [order] = await db
      .insert(tables.posOrder)
      .values({
        tenantId,
        number: nextNumber('POS', count + 1),
        customerPartyId: body.customerPartyId,
        locationId: body.locationId,
        currency: body.currency,
        total: String(total),
        status: 'completed',
      })
      .returning();
    if (!order) throw Errors.internal('Failed to create POS order');

    await db.insert(tables.posOrderLine).values(
      body.lineItems.map((l) => ({
        tenantId,
        orderId: order.id,
        productId: l.productId,
        quantity: String(l.quantity),
        unitPrice: String(l.unitPrice),
        lineTotal: String(l.quantity * l.unitPrice),
      })),
    );

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: 'posOrder.created',
      entityType: 'posOrder',
      entityId: order.id,
    });

    return c.json(order, 201);
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/pos', posRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'pos',
  name: 'POS',
  description: 'Point of sale orders sharing the universal catalog, party and location model.',
  group: 'commercial',
  permissions: ['order:read', 'order:write'],
  enabled: true,
};
