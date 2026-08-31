import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema, nextNumber, logAudit, logActivity } from "@supplyflow/database";
import { inboundShipmentCreateSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(_request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.inbound.read");
    const db = getDb();
    const rows = await db.select({
      id: schema.inboundShipments.id,
      number: schema.inboundShipments.number,
      purchaseOrderId: schema.inboundShipments.purchaseOrderId,
      poNumber: schema.purchaseOrders.number,
      supplierId: schema.inboundShipments.supplierId,
      supplierName: schema.suppliers.name,
      warehouseName: schema.warehouses.name,
      carrier: schema.inboundShipments.carrier,
      trackingNumber: schema.inboundShipments.trackingNumber,
      origin: schema.inboundShipments.origin,
      departedAt: schema.inboundShipments.departedAt,
      expectedArrival: schema.inboundShipments.expectedArrival,
      actualArrival: schema.inboundShipments.actualArrival,
      status: schema.inboundShipments.status,
      notes: schema.inboundShipments.notes,
      createdAt: schema.inboundShipments.createdAt
    }).from(schema.inboundShipments)
      .innerJoin(schema.suppliers, eq(schema.suppliers.id, schema.inboundShipments.supplierId))
      .leftJoin(schema.purchaseOrders, eq(schema.purchaseOrders.id, schema.inboundShipments.purchaseOrderId))
      .leftJoin(schema.warehouses, eq(schema.warehouses.id, schema.inboundShipments.warehouseId))
      .where(and(eq(schema.inboundShipments.organizationId, ctx.user.organizationId), isNull(schema.inboundShipments.deletedAt)))
      .orderBy(desc(schema.inboundShipments.createdAt))
      .limit(200);

    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.inbound.write");
    const parsed = inboundShipmentCreateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    const shipment = await db.transaction(async (tx) => {
      let number = parsed.number;
      if (!number) number = await nextNumber(tx as never, "ASN", ctx.user.organizationId);

      const [row] = await tx.insert(schema.inboundShipments).values({
        organizationId: ctx.user.organizationId,
        number,
        purchaseOrderId: parsed.purchaseOrderId ?? null,
        supplierId: parsed.supplierId,
        warehouseId: parsed.warehouseId ?? null,
        carrier: parsed.carrier ?? null,
        trackingNumber: parsed.trackingNumber ?? null,
        origin: parsed.origin ?? null,
        departedAt: parsed.departedAt ? new Date(parsed.departedAt) : null,
        expectedArrival: parsed.expectedArrival ? new Date(parsed.expectedArrival) : null,
        status: parsed.status,
        notes: parsed.notes ?? null
      }).returning();

      await tx.insert(schema.inboundShipmentLines).values(
        parsed.lines.map((line) => ({
          organizationId: ctx.user.organizationId,
          shipmentId: row.id,
          productId: line.productId,
          purchaseOrderLineId: line.purchaseOrderLineId ?? null,
          quantityExpected: line.quantityExpected
        }))
      );
      return row;
    });

    await logAudit(auditCtx(ctx), "inbound_shipment.created", "inbound_shipment", shipment.id, { number: shipment.number });
    await logActivity(auditCtx(ctx), "inbound_shipment", shipment.id, "created", `Inbound shipment ${shipment.number} created`);

    return jsonOk({ data: shipment }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
