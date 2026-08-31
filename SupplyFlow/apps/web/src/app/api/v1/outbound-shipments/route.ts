import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema, nextNumber, logAudit, logActivity } from "@supplyflow/database";
import { outboundShipmentCreateSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(_request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.outbound.read");
    const db = getDb();
    const rows = await db.select({
      id: schema.outboundShipments.id,
      number: schema.outboundShipments.number,
      customerOrderId: schema.outboundShipments.customerOrderId,
      coNumber: schema.customerOrders.number,
      customerId: schema.outboundShipments.customerId,
      customerName: schema.customers.name,
      warehouseName: schema.warehouses.name,
      carrier: schema.outboundShipments.carrier,
      trackingNumber: schema.outboundShipments.trackingNumber,
      shippedAt: schema.outboundShipments.shippedAt,
      expectedDelivery: schema.outboundShipments.expectedDelivery,
      actualDelivery: schema.outboundShipments.actualDelivery,
      status: schema.outboundShipments.status,
      createdAt: schema.outboundShipments.createdAt
    }).from(schema.outboundShipments)
      .leftJoin(schema.customerOrders, eq(schema.customerOrders.id, schema.outboundShipments.customerOrderId))
      .leftJoin(schema.customers, eq(schema.customers.id, schema.outboundShipments.customerId))
      .leftJoin(schema.warehouses, eq(schema.warehouses.id, schema.outboundShipments.warehouseId))
      .where(and(eq(schema.outboundShipments.organizationId, ctx.user.organizationId), isNull(schema.outboundShipments.deletedAt)))
      .orderBy(desc(schema.outboundShipments.createdAt))
      .limit(200);

    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.outbound.write");
    const parsed = outboundShipmentCreateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    let warehouseId = parsed.warehouseId ?? null;
    if (parsed.customerOrderId && !warehouseId) {
      const [co] = await db.select({ w: schema.customerOrders.warehouseId }).from(schema.customerOrders).where(eq(schema.customerOrders.id, parsed.customerOrderId)).limit(1);
      warehouseId = co?.w ?? null;
    }

    const shipment = await db.transaction(async (tx) => {
      const number = parsed.number ?? (await nextNumber(tx as never, "OS", ctx.user.organizationId));
      const [row] = await tx.insert(schema.outboundShipments).values({
        organizationId: ctx.user.organizationId,
        number,
        customerOrderId: parsed.customerOrderId ?? null,
        customerId: parsed.customerId ?? null,
        warehouseId,
        carrier: parsed.carrier ?? null,
        trackingNumber: parsed.trackingNumber ?? null,
        expectedDelivery: parsed.expectedDelivery ? new Date(parsed.expectedDelivery) : null,
        status: parsed.status === "pending" ? "pending" : parsed.status,
        notes: parsed.notes ?? null
      }).returning();

      await tx.insert(schema.outboundShipmentLines).values(
        parsed.lines.map((line) => ({
          organizationId: ctx.user.organizationId,
          shipmentId: row.id,
          productId: line.productId,
          customerOrderLineId: line.customerOrderLineId ?? null,
          quantity: line.quantity
        }))
      );
      return row;
    });

    await logActivity(auditCtx(ctx), "outbound_shipment", shipment.id, "created", `Outbound shipment ${shipment.number} created`);
    await logAudit(auditCtx(ctx), "outbound_shipment.created", "outbound_shipment", shipment.id, { number: shipment.number });
    return jsonOk({ data: shipment }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
