import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { getDb, schema, nextNumber, logAudit, logActivity } from "@supplyflow/database";
import { poCreateSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("purchasing.read");
    const db = getDb();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status");

    const conditions = [eq(schema.purchaseOrders.organizationId, ctx.user.organizationId), isNull(schema.purchaseOrders.deletedAt)];
    if (q) {
      conditions.push(or(ilike(schema.purchaseOrders.number, `%${q}%`), ilike(schema.suppliers.name, `%${q}%`))!);
    }
    if (status && ["draft", "sent", "confirmed", "partially_received", "received", "cancelled"].includes(status)) {
      conditions.push(eq(schema.purchaseOrders.status, status as never));
    }

    const rows = await db.select({
      id: schema.purchaseOrders.id,
      number: schema.purchaseOrders.number,
      supplierId: schema.purchaseOrders.supplierId,
      supplierName: schema.suppliers.name,
      warehouseId: schema.purchaseOrders.warehouseId,
      warehouseName: schema.warehouses.name,
      status: schema.purchaseOrders.status,
      currency: schema.purchaseOrders.currency,
      orderDate: schema.purchaseOrders.orderDate,
      expectedDate: schema.purchaseOrders.expectedDate,
      subtotal: schema.purchaseOrders.subtotal,
      total: schema.purchaseOrders.total,
      notes: schema.purchaseOrders.notes,
      createdAt: schema.purchaseOrders.createdAt,
      lineCount: sql<number>`(select count(*)::int from purchase_order_lines l where l.purchase_order_id = ${schema.purchaseOrders.id})`,
      receivedQty: sql<number>`coalesce((select sum(l.quantity_received) from purchase_order_lines l where l.purchase_order_id = ${schema.purchaseOrders.id}), 0)`,
      orderedQty: sql<number>`coalesce((select sum(l.quantity) from purchase_order_lines l where l.purchase_order_id = ${schema.purchaseOrders.id}), 0)`
    }).from(schema.purchaseOrders)
      .innerJoin(schema.suppliers, eq(schema.suppliers.id, schema.purchaseOrders.supplierId))
      .leftJoin(schema.warehouses, eq(schema.warehouses.id, schema.purchaseOrders.warehouseId))
      .where(and(...conditions))
      .orderBy(desc(schema.purchaseOrders.createdAt))
      .limit(200);

    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("purchasing.write");
    const parsed = poCreateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    let subtotal = 0;
    for (const line of parsed.lines) {
      subtotal += line.quantity * line.unitCost * (1 - line.discountPercent / 100);
    }
    const total = Math.round(subtotal * 100) / 100;

    const result = await db.transaction(async (tx) => {
      const number = parsed.number ?? (await nextNumber(tx as never, "PO", ctx.user.organizationId));
      const [po] = await tx.insert(schema.purchaseOrders).values({
        organizationId: ctx.user.organizationId,
        number,
        supplierId: parsed.supplierId,
        warehouseId: parsed.warehouseId ?? null,
        status: parsed.status === "sent" ? "sent" : "draft",
        currency: "USD",
        orderDate: parsed.orderDate ?? new Date().toISOString().slice(0, 10),
        expectedDate: parsed.expectedDate ?? null,
        sentAt: parsed.status !== "draft" ? new Date() : null,
        buyerId: ctx.user.userId,
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        notes: parsed.notes ?? null
      }).returning();

      await tx.insert(schema.purchaseOrderLines).values(
        parsed.lines.map((line, i) => ({
          organizationId: ctx.user.organizationId,
          purchaseOrderId: po.id,
          lineNo: i + 1,
          productId: line.productId,
          quantity: line.quantity,
          unitCost: line.unitCost.toFixed(2),
          discountPercent: line.discountPercent,
          total: (line.quantity * line.unitCost * (1 - line.discountPercent / 100)).toFixed(2)
        }))
      );

      return po;
    });

    await logAudit(auditCtx(ctx), "purchase_order.created", "purchase_order", result.id, { number: result.number });
    await logActivity(auditCtx(ctx), "purchase_order", result.id, "created", `Purchase order ${result.number} created`);
    if (parsed.status === "sent") {
      await logActivity(auditCtx(ctx), "purchase_order", result.id, "status_changed", `Status changed: Draft → Sent`);
    }

    return jsonOk({ data: result }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
