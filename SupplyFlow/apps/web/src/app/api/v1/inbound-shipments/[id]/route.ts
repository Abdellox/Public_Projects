import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb, schema, logAudit } from "@supplyflow/database";
import { inboundShipmentUpdateSchema, shipmentStatusValues } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.inbound.read");
    const { id } = await params;
    const db = getDb();
    const shipment = (await db.select().from(schema.inboundShipments).where(and(
      eq(schema.inboundShipments.organizationId, ctx.user.organizationId),
      eq(schema.inboundShipments.id, id),
      isNull(schema.inboundShipments.deletedAt)
    )).limit(1))[0];
    if (!shipment) throw new HttpError(404, "Shipment not found");

    const lines = await db.select({
      id: schema.inboundShipmentLines.id,
      productId: schema.inboundShipmentLines.productId,
      sku: schema.products.sku,
      productName: schema.products.name,
      quantityExpected: schema.inboundShipmentLines.quantityExpected,
      quantityReceived: schema.inboundShipmentLines.quantityReceived
    }).from(schema.inboundShipmentLines)
      .innerJoin(schema.products, eq(schema.products.id, schema.inboundShipmentLines.productId))
      .where(eq(schema.inboundShipmentLines.shipmentId, id))
      .orderBy(asc(schema.inboundShipmentLines.id));

    return jsonOk({ data: { ...shipment, lines } });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("shipments.inbound.write");
    const { id } = await params;
    const parsed = inboundShipmentUpdateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    const { lines: _lines, status, departedAt, expectedArrival, ...rest } = parsed as Record<string, unknown> & { lines?: unknown; status?: unknown; departedAt?: unknown; expectedArrival?: unknown };
    const patch: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    if (status && (shipmentStatusValues as readonly string[]).includes(status as never)) patch.status = status;
    if (departedAt !== undefined) patch.departedAt = departedAt ? new Date(departedAt as string) : null;
    if (expectedArrival !== undefined) patch.expectedArrival = expectedArrival ? new Date(expectedArrival as string) : null;

    const [row] = await db.update(schema.inboundShipments).set(patch).where(and(
      eq(schema.inboundShipments.organizationId, ctx.user.organizationId),
      eq(schema.inboundShipments.id, id)
    )).returning();
    if (!row) throw new HttpError(404, "Shipment not found");

    await logAudit(auditCtx(ctx), "inbound_shipment.updated", "inbound_shipment", id);
    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
}
