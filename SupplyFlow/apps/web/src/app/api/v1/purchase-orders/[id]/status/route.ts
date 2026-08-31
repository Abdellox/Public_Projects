import { and, eq, isNull } from "drizzle-orm";
import { getDb, schema, logAudit, logActivity } from "@supplyflow/database";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";
import type { PoStatus } from "@supplyflow/types";

const TRANSITIONS: Record<PoStatus, PoStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["confirmed", "cancelled"],
  confirmed: ["partially_received", "received", "cancelled"],
  partially_received: ["partially_received", "received", "cancelled"],
  received: [],
  cancelled: []
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const ctx = await requirePermission("purchasing.write");
    const { id } = await params;
    const body = await request.json().catch(() => ({})) as { status?: string };
    const target = body.status as PoStatus | undefined;
    if (!target || !Object.keys(TRANSITIONS).includes(target)) {
      throw new HttpError(400, "Invalid status");
    }

    const db = getDb();
    const po = (await db.select().from(schema.purchaseOrders).where(and(
      eq(schema.purchaseOrders.organizationId, ctx.user.organizationId),
      eq(schema.purchaseOrders.id, id),
      isNull(schema.purchaseOrders.deletedAt)
    )).limit(1))[0];
    if (!po) throw new HttpError(404, "Purchase order not found");

    if (!TRANSITIONS[po.status].includes(target)) {
      throw new HttpError(400, `Cannot transition from "${po.status}" to "${target}"`);
    }

    const lines = await db.select().from(schema.purchaseOrderLines).where(eq(schema.purchaseOrderLines.purchaseOrderId, id));
    const fullyReceived = lines.length > 0 && lines.every((l) => l.quantityReceived >= l.quantity - 1e-9);
    const partiallyReceived = lines.some((l) => l.quantityReceived > 0);

    if (target === "received" && !fullyReceived) {
      throw new HttpError(400, "Cannot mark received until all lines are fully received. Receive the inbound shipment first.");
    }
    if (target === "partially_received" && !partiallyReceived) {
      throw new HttpError(400, "No quantities received yet.");
    }

    const now = new Date();
    const patch: Record<string, unknown> = { status: target, updatedAt: now };
    if (target === "sent") patch.sentAt = now;
    if (target === "confirmed") patch.confirmedAt = now;
    if (target === "received") patch.receivedAt = now;
    if (target === "cancelled") patch.cancelledAt = now;

    const [row] = await db.update(schema.purchaseOrders).set(patch).where(eq(schema.purchaseOrders.id, id)).returning();

    await logAudit(auditCtx(ctx), "purchase_order.status_changed", "purchase_order", id, { from: po.status, to: target });
    await logActivity(auditCtx(ctx), "purchase_order", id, "status_changed", `Status changed: ${label(po.status)} → ${label(target)}`);

    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
}

function label(status: PoStatus): string {
  return { draft: "Draft", sent: "Sent", confirmed: "Confirmed", partially_received: "Partially received", received: "Received", cancelled: "Cancelled" }[status];
}
