import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb, schema, logAudit, logActivity, applyMovement } from "@supplyflow/database";
import { receiveShipmentSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.inbound.write");
    const { id } = await params;
    const parsed = receiveShipmentSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    const shipment = (await db.select().from(schema.inboundShipments).where(and(
      eq(schema.inboundShipments.organizationId, ctx.user.organizationId),
      eq(schema.inboundShipments.id, id),
      isNull(schema.inboundShipments.deletedAt)
    )).limit(1))[0];
    if (!shipment) throw new HttpError(404, "Shipment not found");
    if (!["in_transit", "arrived", "pending"].includes(shipment.status)) {
      throw new HttpError(400, `Cannot receive a shipment in status "${shipment.status}"`);
    }

    const lines = await db.select().from(schema.inboundShipmentLines)
      .where(eq(schema.inboundShipmentLines.shipmentId, id))
      .orderBy(asc(schema.inboundShipmentLines.id));

    for (const input of parsed.lines) {
      const line = lines.find((l) => l.id === input.lineId);
      if (!line) throw new HttpError(404, "A provided line does not belong to this shipment");
      if (input.quantityReceived > line.quantityExpected - line.quantityReceived + 1e-9) {
        throw new HttpError(400, "Receive quantity exceeds remaining expected quantity");
      }
    }

    const destinationWarehouse = shipment.warehouseId;
    if (!destinationWarehouse) throw new HttpError(400, "Shipment has no destination warehouse configured");

    await db.transaction(async (tx) => {
      for (const input of parsed.lines) {
        if (input.quantityReceived <= 0) continue;
        const line = lines.find((l) => l.id === input.lineId)!;
        await tx.update(schema.inboundShipmentLines)
          .set({ quantityReceived: line.quantityReceived + input.quantityReceived })
          .where(eq(schema.inboundShipmentLines.id, line.id));

        if (line.purchaseOrderLineId) {
          await tx.update(schema.purchaseOrderLines)
            .set({ quantityReceived: sql`${schema.purchaseOrderLines.quantityReceived} + ${input.quantityReceived}` })
            .where(eq(schema.purchaseOrderLines.id, line.purchaseOrderLineId));
        }

        await applyMovement(tx, auditCtx(ctx), {
          productId: line.productId,
          variantId: line.variantId,
          warehouseId: destinationWarehouse,
          type: "receipt",
          quantity: input.quantityReceived,
          referenceType: "inbound_shipment",
          referenceId: shipment.id,
          reason: `Received via ${shipment.number}`
        });
      }

      const allDone = lines.every((l) => {
        const input = parsed.lines.find((i) => i.lineId === l.id);
        const newQty = l.quantityReceived + (input?.quantityReceived ?? 0);
        return newQty >= l.quantityExpected - 1e-9;
      });

      await tx.update(schema.inboundShipments).set({
        status: allDone ? "completed" : "arrived",
        actualArrival: shipment.actualArrival ?? new Date(),
        updatedAt: new Date()
      }).where(eq(schema.inboundShipments.id, id));
    });

    if (shipment.purchaseOrderId) {
      const poLines = await db.select().from(schema.purchaseOrderLines).where(eq(schema.purchaseOrderLines.purchaseOrderId, shipment.purchaseOrderId));
      const fully = poLines.length > 0 && poLines.every((l) => l.quantityReceived >= l.quantity - 1e-9);
      const partly = poLines.some((l) => l.quantityReceived > 0);
      const nextStatus = fully ? "received" : partly ? "partially_received" : null;
      if (nextStatus) {
        const patch: Record<string, unknown> = { status: nextStatus, updatedAt: new Date() };
        if (fully) patch.receivedAt = new Date();
        await db.update(schema.purchaseOrders).set(patch).where(eq(schema.purchaseOrders.id, shipment.purchaseOrderId));
        await logActivity(auditCtx(ctx), "purchase_order", shipment.purchaseOrderId, "status_changed", `Receipt recorded from ${shipment.number}`);
      }
    }

    await logAudit(auditCtx(ctx), "inbound_shipment.received", "inbound_shipment", id, { lines: parsed.lines.length });
    await logActivity(auditCtx(ctx), "inbound_shipment", id, "received", "Goods received into warehouse; inventory updated");

    return jsonOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
