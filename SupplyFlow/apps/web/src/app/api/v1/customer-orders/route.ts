import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema, nextNumber, logAudit, logActivity } from "@supplyflow/database";
import { customerOrderCreateSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(_request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("orders.read");
    const db = getDb();
    const rows = await db.select({
      id: schema.customerOrders.id,
      number: schema.customerOrders.number,
      customerId: schema.customerOrders.customerId,
      customerName: schema.customers.name,
      warehouseId: schema.customerOrders.warehouseId,
      warehouseName: schema.warehouses.name,
      status: schema.customerOrders.status,
      priority: schema.customerOrders.priority,
      currency: schema.customerOrders.currency,
      orderDate: schema.customerOrders.orderDate,
      requiredDate: schema.customerOrders.requiredDate,
      total: schema.customerOrders.total,
      notes: schema.customerOrders.notes,
      createdAt: schema.customerOrders.createdAt
    }).from(schema.customerOrders)
      .innerJoin(schema.customers, eq(schema.customers.id, schema.customerOrders.customerId))
      .leftJoin(schema.warehouses, eq(schema.warehouses.id, schema.customerOrders.warehouseId))
      .where(and(eq(schema.customerOrders.organizationId, ctx.user.organizationId), isNull(schema.customerOrders.deletedAt)))
      .orderBy(desc(schema.customerOrders.createdAt))
      .limit(200);

    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("orders.write");
    const parsed = customerOrderCreateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    let subtotal = 0;
    for (const line of parsed.lines) subtotal += line.quantity * line.unitPrice * (1 - line.discountPercent / 100);

    const order = await db.transaction(async (tx) => {
      const number = parsed.number ?? (await nextNumber(tx as never, "SO", ctx.user.organizationId));
      const [row] = await tx.insert(schema.customerOrders).values({
        organizationId: ctx.user.organizationId,
        number,
        customerId: parsed.customerId,
        warehouseId: parsed.warehouseId ?? null,
        status: parsed.status,
        priority: parsed.priority,
        currency: "USD",
        orderDate: parsed.orderDate ?? new Date().toISOString().slice(0, 10),
        requiredDate: parsed.requiredDate ?? null,
        subtotal: subtotal.toFixed(2),
        total: subtotal.toFixed(2),
        salespersonId: ctx.user.userId,
        notes: parsed.notes ?? null
      }).returning();

      await tx.insert(schema.customerOrderLines).values(
        parsed.lines.map((line, i) => ({
          organizationId: ctx.user.organizationId,
          customerOrderId: row.id,
          lineNo: i + 1,
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice.toFixed(2),
          discountPercent: line.discountPercent,
          total: (line.quantity * line.unitPrice * (1 - line.discountPercent / 100)).toFixed(2)
        }))
      );
      return row;
    });

    await logAudit(auditCtx(ctx), "customer_order.created", "customer_order", order.id, { number: order.number });
    await logActivity(auditCtx(ctx), "customer_order", order.id, "created", `Customer order ${order.number} created`);
    return jsonOk({ data: order }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
