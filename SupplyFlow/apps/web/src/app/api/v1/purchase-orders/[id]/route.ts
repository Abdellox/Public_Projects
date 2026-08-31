import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema, logAudit, num } from "@supplyflow/database";
import { poUpdateSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";

async function loadPo(organizationId: string, id: string) {
  const po = (await getDb().select().from(schema.purchaseOrders).where(and(
    eq(schema.purchaseOrders.organizationId, organizationId),
    eq(schema.purchaseOrders.id, id),
    isNull(schema.purchaseOrders.deletedAt)
  )).limit(1))[0];
  if (!po) throw new HttpError(404, "Purchase order not found");
  return po;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("purchasing.read");
    const { id } = await params;
    const db = getDb();
    const po = await loadPo(ctx.user.organizationId, id);
    const lines = await db.select({
      id: schema.purchaseOrderLines.id,
      lineNo: schema.purchaseOrderLines.lineNo,
      productId: schema.purchaseOrderLines.productId,
      sku: schema.products.sku,
      productName: schema.products.name,
      quantity: schema.purchaseOrderLines.quantity,
      quantityReceived: schema.purchaseOrderLines.quantityReceived,
      unitCost: schema.purchaseOrderLines.unitCost,
      discountPercent: schema.purchaseOrderLines.discountPercent,
      total: schema.purchaseOrderLines.total
    }).from(schema.purchaseOrderLines)
      .innerJoin(schema.products, eq(schema.products.id, schema.purchaseOrderLines.productId))
      .where(eq(schema.purchaseOrderLines.purchaseOrderId, id))
      .orderBy(asc(schema.purchaseOrderLines.lineNo));

    const [supplier] = await db.select({ name: schema.suppliers.name }).from(schema.suppliers).where(eq(schema.suppliers.id, po.supplierId)).limit(1);
    const activities = await db.select({
      id: schema.activities.id,
      action: schema.activities.action,
      summary: schema.activities.summary,
      createdAt: schema.activities.createdAt
    }).from(schema.activities)
      .where(and(eq(schema.activities.entityType, "purchase_order"), eq(schema.activities.entityId, id)))
      .orderBy(desc(schema.activities.createdAt))
      .limit(50);

    return jsonOk({ data: { ...po, supplierName: supplier?.name ?? null, lines, activities } });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("purchasing.write");
    const { id } = await params;
    const existing = await loadPo(ctx.user.organizationId, id);
    if (!["draft", "sent"].includes(existing.status)) {
      throw new HttpError(400, `Cannot edit a purchase order in status "${existing.status}". Cancel it and create a new order instead.`);
    }

    const parsed = poUpdateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    const updated = await db.transaction(async (tx) => {
      let subtotal = 0;
      if (parsed.lines) {
        const currentLines = await tx.select().from(schema.purchaseOrderLines).where(eq(schema.purchaseOrderLines.purchaseOrderId, id));
        if (currentLines.some((l) => l.quantityReceived > 0)) {
          throw new HttpError(400, "Some lines already have received quantities and cannot be modified");
        }
        for (const line of parsed.lines) subtotal += line.quantity * line.unitCost * (1 - line.discountPercent / 100);

        await tx.delete(schema.purchaseOrderLines).where(eq(schema.purchaseOrderLines.purchaseOrderId, id));

        await tx.insert(schema.purchaseOrderLines).values(
          parsed.lines.map((line, i) => ({
            organizationId: ctx.user.organizationId,
            purchaseOrderId: id,
            lineNo: i + 1,
            productId: line.productId,
            quantity: line.quantity,
            unitCost: line.unitCost.toFixed(2),
            discountPercent: line.discountPercent,
            total: (line.quantity * line.unitCost * (1 - line.discountPercent / 100)).toFixed(2)
          }))
        );
      } else {
        const lines = await tx.select().from(schema.purchaseOrderLines).where(eq(schema.purchaseOrderLines.purchaseOrderId, id));
        for (const line of lines) subtotal += line.quantity * num(line.unitCost) * (1 - line.discountPercent / 100);
      }

      const { lines: _lines, ...header } = parsed;
      const [row] = await tx.update(schema.purchaseOrders).set({
        ...header,
        subtotal: subtotal.toFixed(2),
        total: subtotal.toFixed(2),
        updatedAt: new Date()
      }).where(eq(schema.purchaseOrders.id, id)).returning();
      return row;
    });

    await logAudit(auditCtx(ctx), "purchase_order.updated", "purchase_order", id);
    return jsonOk({ data: updated });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("purchasing.write");
    const { id } = await params;
    const po = await loadPo(ctx.user.organizationId, id);
    if (!["draft", "cancelled"].includes(po.status)) {
      throw new HttpError(400, "Only draft or cancelled orders can be deleted");
    }
    const db = getDb();
    await db.transaction(async (tx) => {
      await tx.delete(schema.purchaseOrderLines).where(eq(schema.purchaseOrderLines.purchaseOrderId, id));
      await tx.delete(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
    });
    await logAudit(auditCtx(ctx), "purchase_order.deleted", "purchase_order", id, { number: po.number });
    return jsonOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
