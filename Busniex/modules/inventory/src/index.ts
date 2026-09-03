import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors, nextNumber, sumMoney } from '@businex/lib';
import { getIdentity, requirePermission } from '@businex/auth';
import { inventoryItemSchema, stockMovementSchema, purchaseOrderSchema, posOrderSchema } from '@businex/validation';
import { writeAudit } from '@businex/module-audit';
import type { ModuleDescriptor } from '@businex/types';

/**
 * Inventory & Procurement module.
 *
 * Stock is tracked per product at a warehouse location. Purchase orders and
 * receipts reuse the canonical Party (suppliers) and Product catalog. Sales,
 * procurement and inventory all share the same Product entity.
 */
export function inventoryRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const identity = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c);
  const tenantOf = (c: Parameters<typeof getIdentity>[0]) => identity(c).tenantId;

  // -------- Inventory items --------
  app.get('/items', requirePermission('inventory:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.inventoryItem)
      .where(eq(tables.inventoryItem.tenantId, tenantId));
    return c.json(rows);
  });

  app.post('/items', requirePermission('inventory:write'), async (c) => {
    const body = inventoryItemSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const [row] = await db
      .insert(tables.inventoryItem)
      .values({
        tenantId,
        productId: body.productId,
        locationId: body.locationId,
        quantityOnHand: String(body.quantityOnHand),
        reservedQuantity: String(body.reservedQuantity),
        availableQuantity: String(body.quantityOnHand - body.reservedQuantity),
      })
      .returning();
    return c.json(row, 201);
  });

  // -------- Stock movements --------
  app.post('/stock', requirePermission('stock:write'), async (c) => {
    const body = stockMovementSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const me = identity(c);

    const [item] = await db
      .select()
      .from(tables.inventoryItem)
      .where(
        and(
          eq(tables.inventoryItem.tenantId, tenantId),
          eq(tables.inventoryItem.productId, body.productId),
          eq(tables.inventoryItem.locationId, body.locationId),
        ),
      );

    if (!item) throw Errors.notFound('No inventory item for product at this location');

    const onHand = Number(item.quantityOnHand) + body.quantity;
    if (onHand < 0) throw Errors.badRequest('Insufficient stock');

    await db
      .update(tables.inventoryItem)
      .set({
        quantityOnHand: String(onHand),
        availableQuantity: String(onHand - Number(item.reservedQuantity)),
        updatedAt: new Date(),
      })
      .where(eq(tables.inventoryItem.id, item.id));

    const [movement] = await db
      .insert(tables.stockMovement)
      .values({
        tenantId,
        productId: body.productId,
        locationId: body.locationId,
        quantity: String(body.quantity),
        type: body.type,
        referenceId: body.referenceId,
        at: new Date(),
      })
      .returning();
    if (!movement) throw Errors.internal('Failed to record movement');

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: `stock.${body.type}`,
      entityType: 'stockMovement',
      entityId: movement.id,
    });

    return c.json(movement, 201);
  });

  // -------- Purchase orders --------
  app.get('/purchase-orders', requirePermission('purchaseOrder:read'), async (c) => {
    const tenantId = tenantOf(c);
    const rows = await db
      .select()
      .from(tables.purchaseOrder)
      .where(eq(tables.purchaseOrder.tenantId, tenantId))
      .orderBy(desc(tables.purchaseOrder.createdAt));
    return c.json(rows);
  });

  app.post('/purchase-orders', requirePermission('purchaseOrder:write'), async (c) => {
    const body = purchaseOrderSchema.parse(await c.req.json());
    const tenantId = tenantOf(c);
    const me = identity(c);
    const total = sumMoney(body.lineItems.map((l) => l.quantity * l.unitPrice));
    const count = await db
      .select({ n: tables.purchaseOrder.id })
      .from(tables.purchaseOrder)
      .where(eq(tables.purchaseOrder.tenantId, tenantId))
      .then((r) => r.length);

    const [po] = await db
      .insert(tables.purchaseOrder)
      .values({
        tenantId,
        number: nextNumber('PO', count + 1),
        supplierPartyId: body.supplierPartyId,
        warehouseId: body.warehouseId,
        currency: body.currency,
        total: String(total),
      })
      .returning();
    if (!po) throw Errors.internal('Failed to create purchase order');

    await db.insert(tables.purchaseOrderLine).values(
      body.lineItems.map((l) => ({
        tenantId,
        orderId: po.id,
        productId: l.productId,
        description: l.description,
        quantity: String(l.quantity),
        unitPrice: String(l.unitPrice),
        lineTotal: String(l.quantity * l.unitPrice),
      })),
    );

    await writeAudit(db, tenantId, {
      actorUserId: me.userId,
      action: 'purchaseOrder.created',
      entityType: 'purchaseOrder',
      entityId: po.id,
    });

    return c.json(po, 201);
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/inventory', inventoryRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'inventory',
  name: 'Inventory & Procurement',
  description: 'Stock management, stock movements, and purchase orders sharing the universal catalog.',
  group: 'supply-chain',
  permissions: ['inventory:read', 'inventory:write', 'stock:write', 'purchaseOrder:read', 'purchaseOrder:write'],
  enabled: true,
};
