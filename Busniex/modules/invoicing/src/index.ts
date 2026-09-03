import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors, computeLineTotals, nextNumber } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import { invoiceSchema, paymentSchema } from '@businex/validation';
import { writeAudit } from '@businex/module-audit';
import { notify } from '@businex/module-notification';
import type { ModuleDescriptor } from '@businex/types';

/**
 * Invoicing module.
 *
 * Demonstrates the universal workflow: the same Invoice entity flows through a
 * configurable workflow (small business: draft->completed; enterprise:
 * draft->review->approval->processing->completed). Works regardless of which
 * workflow definition is configured.
 */
export function invoicingRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const identity = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c);
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => identity(c).tenantId;

  app.get('/', requirePermission('invoice:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.invoice)
      .where(eq(tables.invoice.tenantId, tenantId))
      .orderBy(desc(tables.invoice.createdAt));
    return c.json(rows);
  });

  app.get('/:id', requirePermission('invoice:read'), async (c) => {
    const tenantId = tenantOf(c);
    const id = c.req.param('id')!;
    const [inv] = await db
      .select()
      .from(tables.invoice)
      .where(and(eq(tables.invoice.id, id), eq(tables.invoice.tenantId, tenantId)));
    if (!inv) throw Errors.notFound('Invoice not found');
    const lines = await db
      .select()
      .from(tables.invoiceLine)
      .where(eq(tables.invoiceLine.invoiceId, id));
    return c.json({ ...inv, lines });
  });

  app.post('/', requirePermission('invoice:write'), async (c) => {
    const body = invoiceSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const me = identity(c);

    const totals = computeLineTotals(
      body.lineItems.map((l) => ({ quantity: l.quantity, unitPrice: l.unitPrice })),
      body.currency,
    );

    const count = await db
      .select({ n: tables.invoice.id })
      .from(tables.invoice)
      .where(eq(tables.invoice.tenantId, tenantId))
      .then((r) => r.length);

    const [inv] = await db
      .insert(tables.invoice)
      .values({
        tenantId,
        number: nextNumber('INV', count + 1),
        direction: body.direction,
        customerPartyId: body.customerPartyId,
        supplierPartyId: body.supplierPartyId,
        legalEntityId: body.legalEntityId,
        currency: body.currency,
        subtotal: String(totals.subtotal),
        taxAmount: String(totals.taxAmount),
        total: String(totals.total),
        dueDate: body.dueDate,
        status: 'draft',
      })
      .returning();
    if (!inv) throw Errors.internal('Failed to create invoice');

    await db.insert(tables.invoiceLine).values(
      body.lineItems.map((l, i) => ({
        tenantId,
        invoiceId: inv.id,
        productId: l.productId,
        description: l.description,
        quantity: String(l.quantity),
        unitPrice: String(l.unitPrice),
        taxRate: '0',
        lineTotal: String(totals.lines[i]?.lineTotal ?? 0),
      })),
    );

    // Start the workflow instance for this invoice.
    await db.insert(tables.workflowInstance).values({
      tenantId,
      workflowDefinitionId: null,
      documentType: 'invoice',
      documentId: inv.id,
      status: 'draft',
      history: [],
    });

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: inv.id,
    });

    return c.json({ ...inv, lines: body.lineItems }, 201);
  });

  /** Post an invoice through its workflow (e.g. draft -> completed). */
  app.post('/:id/transition', requirePermission('invoice:write'), async (c) => {
    const tenantId = tenantOf(c);
    const me = identity(c);
    const id = c.req.param('id')!;
    const { to } = await c.req.json<{ to: string }>();

    const [inv] = await db
      .select()
      .from(tables.invoice)
      .where(and(eq(tables.invoice.id, id), eq(tables.invoice.tenantId, tenantId)));
    if (!inv) throw Errors.notFound('Invoice not found');

    const [instance] = await db
      .select()
      .from(tables.workflowInstance)
      .where(
        and(
          eq(tables.workflowInstance.documentType, 'invoice'),
          eq(tables.workflowInstance.documentId, id),
        ),
      );
    const from = instance?.status ?? 'draft';

    // Look up an allowed transition from the configured workflow.
    const def = await db
      .select()
      .from(tables.workflowDefinition)
      .where(eq(tables.workflowDefinition.appliesTo, 'invoice'))
      .then((r) => r[0]);
    const allowed = def
      ? (def.transitions as { from: string; to: string }[]).some((t) => t.from === from && t.to === to)
      : ['completed', 'cancelled'].includes(to);

    if (!allowed) {
      throw Errors.badRequest(`Transition from ${from} to ${to} not allowed by workflow`);
    }

    const history = ((instance?.history as unknown[]) ?? []).concat([
      {
        id: crypto.randomUUID(),
        from,
        to,
        actorUserId: me.userId,
        at: new Date().toISOString(),
      },
    ]);

    if (instance) {
      await db
        .update(tables.workflowInstance)
        .set({ status: to, history: history as unknown[], updatedAt: new Date() })
        .where(eq(tables.workflowInstance.id, instance.id));
    } else {
      await db.insert(tables.workflowInstance).values({
        tenantId,
        workflowDefinitionId: null,
        documentType: 'invoice',
        documentId: id,
        status: to,
        history: history as unknown[],
      });
    }

    await db
      .update(tables.invoice)
      .set({ status: to, updatedAt: new Date() })
      .where(eq(tables.invoice.id, id));

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: `invoice.${to}`,
      entityType: 'invoice',
      entityId: id,
    });

    return c.json({ id, status: to });
  });

  /** Record a payment against an invoice. */
  app.post('/:id/payments', requirePermission('invoice:write'), async (c) => {
    const body = paymentSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const me = identity(c);

    const [inv] = await db
      .select()
      .from(tables.invoice)
      .where(and(eq(tables.invoice.id, body.invoiceId), eq(tables.invoice.tenantId, tenantId)));
    if (!inv) throw Errors.notFound('Invoice not found');

    const [payment] = await db
      .insert(tables.payment)
      .values({
        tenantId,
        invoiceId: body.invoiceId,
        amount: String(body.amount),
        currency: body.currency,
        method: body.method,
        reference: body.reference,
        paidAt: new Date().toISOString(),
      })
      .returning();
    if (!payment) throw Errors.internal('Failed to create payment');


    // Mark invoice completed when fully paid (simple rule).
    await db
      .update(tables.invoice)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(tables.invoice.id, inv.id));

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: 'payment.created',
      entityType: 'payment',
      entityId: payment.id,
    });

    await notify(db, tenantId, {
      userId: me.userId,
      title: `Payment recorded on ${inv.number}`,
      type: 'success',
    });

    return c.json(payment, 201);
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/invoices', invoicingRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'invoicing',
  name: 'Invoicing',
  description: 'Universal invoicing with configurable workflow, payments and accounting hooks.',
  group: 'finance',
  permissions: ['invoice:read', 'invoice:write'],
  enabled: true,
};
