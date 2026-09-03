import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors, computeLineTotals, nextNumber, sumMoney } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import { leadSchema, opportunitySchema, quoteSchema, salesOrderSchema } from '@businex/validation';
import { writeAudit } from '@businex/module-audit';
import type { ModuleDescriptor } from '@businex/types';

/**
 * CRM module — leads, opportunities, quotations and sales orders.
 *
 * Reuses the canonical Party (customers), Product (catalog) and Workflow
 * engine. No duplicated customer/product entities here.
 */
export function crmRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const identity = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c);
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => identity(c).tenantId;

  // -------- Leads --------
  app.get('/leads', requirePermission('lead:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.lead)
      .where(eq(tables.lead.tenantId, tenantId))
      .orderBy(desc(tables.lead.createdAt));
    return c.json(rows);
  });

  app.post('/leads', requirePermission('lead:write'), async (c) => {
    const body = leadSchema.parse(await c.req.json());
    const [row] = await db.insert(tables.lead).values({ ...body, tenantId: tenantOf(c) }).returning();
    return c.json(row, 201);
  });

  // -------- Opportunities --------
  app.get('/opportunities', requirePermission('opportunity:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.opportunity)
      .where(eq(tables.opportunity.tenantId, tenantId))
      .orderBy(desc(tables.opportunity.createdAt));
    return c.json(rows);
  });

  app.post('/opportunities', requirePermission('opportunity:write'), async (c) => {
    const body = opportunitySchema.parse(await c.req.json());
    const [row] = await db
      .insert(tables.opportunity)
      .values({
        tenantId: tenantOf(c),
        name: body.name,
        customerPartyId: body.customerPartyId,
        amount: String(body.amount.amount),
        currency: body.amount.currency,
        probability: body.probability,
      })
      .returning();
    return c.json(row, 201);
  });

  // -------- Quotes / Quotations --------
  app.get('/quotes', requirePermission('quote:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.quote)
      .where(eq(tables.quote.tenantId, tenantId))
      .orderBy(desc(tables.quote.createdAt));
    return c.json(rows);
  });

  app.post('/quotes', requirePermission('quote:write'), async (c) => {
    const body = quoteSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const me = identity(c);
    const total = sumMoney(body.lineItems.map((l) => l.quantity * l.unitPrice));
    const count = await db
      .select({ n: tables.quote.id })
      .from(tables.quote)
      .where(eq(tables.quote.tenantId, tenantId))
      .then((r) => r.length);

    const [quote] = await db
      .insert(tables.quote)
      .values({
        tenantId,
        number: nextNumber('QT', count + 1),
        customerPartyId: body.customerPartyId,
        opportunityId: body.opportunityId,
        currency: body.currency,
        total: String(total),
        validUntil: body.validUntil,
      })
      .returning();
    if (!quote) throw Errors.internal('Failed to create quote');

    await db.insert(tables.quoteLine).values(
      body.lineItems.map((l) => ({
        tenantId,
        quoteId: quote.id,
        productId: l.productId,
        description: l.description,
        quantity: String(l.quantity),
        unitPrice: String(l.unitPrice),
        lineTotal: String(l.quantity * l.unitPrice),
      })),
    );

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: 'quote.created',
      entityType: 'quote',
      entityId: quote.id,
    });

    return c.json(quote, 201);
  });

  // -------- Sales Orders --------
  app.get('/orders', requirePermission('order:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.salesOrder)
      .where(eq(tables.salesOrder.tenantId, tenantId))
      .orderBy(desc(tables.salesOrder.createdAt));
    return c.json(rows);
  });

  app.post('/orders', requirePermission('order:write'), async (c) => {
    const body = salesOrderSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const me = identity(c);
    const total = sumMoney(body.lineItems.map((l) => l.quantity * l.unitPrice));
    const count = await db
      .select({ n: tables.salesOrder.id })
      .from(tables.salesOrder)
      .where(eq(tables.salesOrder.tenantId, tenantId))
      .then((r) => r.length);

    const [order] = await db
      .insert(tables.salesOrder)
      .values({
        tenantId,
        number: nextNumber('SO', count + 1),
        customerPartyId: body.customerPartyId,
        warehouseId: body.warehouseId,
        currency: body.currency,
        total: String(total),
      })
      .returning();
    if (!order) throw Errors.internal('Failed to create order');

    await db.insert(tables.salesOrderLine).values(
      body.lineItems.map((l) => ({
        tenantId,
        orderId: order.id,
        productId: l.productId,
        description: l.description,
        quantity: String(l.quantity),
        unitPrice: String(l.unitPrice),
        lineTotal: String(l.quantity * l.unitPrice),
      })),
    );

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: 'order.created',
      entityType: 'order',
      entityId: order.id,
    });

    return c.json(order, 201);
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/crm', crmRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'crm',
  name: 'CRM',
  description: 'Customer relationship management: leads, opportunities, quotations and sales orders.',
  group: 'commercial',
  permissions: ['lead:read', 'lead:write', 'opportunity:read', 'opportunity:write', 'quote:read', 'quote:write', 'order:read', 'order:write'],
  enabled: true,
};
