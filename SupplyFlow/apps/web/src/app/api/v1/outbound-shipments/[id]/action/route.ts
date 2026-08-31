import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb, schema, logAudit, logActivity, applyMovement, releaseReservation } from "@supplyflow/database";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.outbound.write");
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: "ship" | "deliver" };
    const action = body.action;
    if (!action || !["ship", "deliver"].includes(action)) {
      throw new HttpError(400, "Provide action: ship or deliver");
    }

    const db = getDb();
    const shipment = (await db.select().from(schema.outboundShipments).where(and(
      eq(schema.outboundShipments.organizationId, ctx.user.organizationId),
      eq(schema.outboundShipments.id, id),
      isNull(schema.outboundShipments.deletedAt)
    )).limit(1))[0];
    if (!shipment) throw new HttpError(404, "Shipment not found");
    const warehouseId = shipment.warehouseId;
    if (!warehouseId) throw new HttpError(400, "Shipment has no source warehouse configured");

    const lines = await db.select().from(schema.outboundShipmentLines)
      .where(eq(schema.outboundShipmentLines.shipmentId, id))
      .orderBy(asc(schema.outboundShipmentLines.id));

    if (action === "ship") {
      if (!["pending", "picking", "packed"].includes(shipment.status)) {
        throw new HttpError(400, `Cannot ship a shipment in status "${shipment.status}"`);
      }
      for (const line of lines) {
        await applyMovement(db, auditCtx(ctx), {
          productId: line.productId,
          variantId: line.variantId,
          warehouseId,
          type: "shipment",
          quantity: line.quantity,
          referenceType: "outbound_shipment",
          referenceId: shipment.id,
          reason: `Shipped via ${shipment.number}`
        });
        await releaseReservation(db, ctx.user.organizationId, line.productId, line.variantId ?? null, warehouseId, line.quantity);

        if (line.customerOrderLineId) {
          await db.update(schema.customerOrderLines)
            .set({ quantityShipped: sql`${schema.customerOrderLines.quantityShipped} + ${line.quantity}` })
            .where(eq(schema.customerOrderLines.id, line.customerOrderLineId));
        }
      }

      let nextCoStatus: string | null = null;
      if (shipment.customerOrderId) {
        const coLines = await db.select().from(schema.customerOrderLines).where(eq(schema.customerOrderLines.customerOrderId, shipment.customerOrderId));
        const fully = coLines.length > 0 && coLines.every((l) => l.quantityShipped >= l.quantity - 1e-9);
        const partly = coLines.some((l) => l.quantityShipped > 0);
        nextCoStatus = fully ? "shipped" : partly ? "partially_shipped" : null;
        if (nextCoStatus) {
          await db.update(schema.customerOrders).set({ status: nextCoStatus as never, updatedAt: new Date() }).where(eq(schema.customerOrders.id, shipment.customerOrderId));
          await logActivity(auditCtx(ctx), "customer_order", shipment.customerOrderId, "status_changed", `Shipment ${shipment.number} dispatched → ${nextCoStatus}`);
        }
      }

      const [row] = await db.update(schema.outboundShipments).set({
        status: "shipped",
        shippedAt: new Date(),
        updatedAt: new Date()
      }).where(eq(schema.outboundShipments.id, id)).returning();

      await logActivity(auditCtx(ctx), "outbound_shipment", id, "shipped", "Goods dispatched; inventory decremented");
      await logAudit(auditCtx(ctx), "outbound_shipment.shipped", "outbound_shipment", id);
      return jsonOk({ data: row });
    }

    if (shipment.status !== "shipped") {
      throw new HttpError(400, "Only shipped shipments can be marked delivered");
    }
    const [row] = await db.update(schema.outboundShipments).set({
      status: "delivered",
      actualDelivery: new Date(),
      updatedAt: new Date()
    }).where(eq(schema.outboundShipments.id, id)).returning();

    if (shipment.customerOrderId) {
      await db.update(schema.customerOrders).set({ status: "delivered", updatedAt: new Date() })
        .where(eq(schema.customerOrders.id, shipment.customerOrderId));
      await logActivity(auditCtx(ctx), "customer_order", shipment.customerOrderId, "status_changed", `Delivered via ${shipment.number}`);
    }

    await logActivity(auditCtx(ctx), "outbound_shipment", id, "delivered", "Delivery confirmed");
    await logAudit(auditCtx(ctx), "outbound_shipment.delivered", "outbound_shipment", id);
    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
}
