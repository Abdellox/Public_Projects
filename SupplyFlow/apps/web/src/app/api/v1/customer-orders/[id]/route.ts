import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb, logAudit, schema } from "@supplyflow/database";
import { customerOrderUpdateSchema, customerOrderStatusValues } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("orders.read");
    const { id } = await params;
    const db = getDb();
    const order = (await db.select().from(schema.customerOrders).where(and(
      eq(schema.customerOrders.organizationId, ctx.user.organizationId),
      eq(schema.customerOrders.id, id),
      isNull(schema.customerOrders.deletedAt)
    )).limit(1))[0];
    if (!order) throw new HttpError(404, "Order not found");

    const lines = await db.select({
      id: schema.customerOrderLines.id,
      lineNo: schema.customerOrderLines.lineNo,
      productId: schema.customerOrderLines.productId,
      sku: schema.products.sku,
      productName: schema.products.name,
      quantity: schema.customerOrderLines.quantity,
      quantityShipped: schema.customerOrderLines.quantityShipped,
      unitPrice: schema.customerOrderLines.unitPrice,
      total: schema.customerOrderLines.total
    }).from(schema.customerOrderLines)
      .innerJoin(schema.products, eq(schema.products.id, schema.customerOrderLines.productId))
      .where(eq(schema.customerOrderLines.customerOrderId, id))
      .orderBy(asc(schema.customerOrderLines.lineNo));

    return jsonOk({ data: { ...order, lines } });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("orders.write");
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const parsed = customerOrderUpdateSchema.parse(body);

    const db = getDb();
    const order = (await db.select().from(schema.customerOrders).where(and(
      eq(schema.customerOrders.organizationId, ctx.user.organizationId),
      eq(schema.customerOrders.id, id),
      isNull(schema.customerOrders.deletedAt)
    )).limit(1))[0];
    if (!order) throw new HttpError(404, "Order not found");

    if (parsed.status && (customerOrderStatusValues as readonly string[]).includes(parsed.status)) {
      if (!["draft", "confirmed", "cancelled"].includes(order.status)) {
        throw new HttpError(400, `Use shipments to progress an order already in "${order.status}"`);
      }
    }

    const [row] = await db.update(schema.customerOrders).set({ ...parsed, updatedAt: new Date() })
      .where(eq(schema.customerOrders.id, id)).returning();

    await logAudit(auditCtx(ctx), "customer_order.updated", "customer_order", id, body ?? {});
    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
}
