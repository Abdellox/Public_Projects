import { sql } from "drizzle-orm";
import { getDb, logAudit, adjustInventory, applyMovement } from "@supplyflow/database";
import { inventoryAdjustSchema, transferCreateSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(): Promise<Response> {
  try {
    const ctx = await requirePermission("inventory.read");
    const result = await getDb().execute(sql`
      select p.id as product_id, p.sku, p.name, w.id as warehouse_id, w.code as warehouse_code,
             coalesce(i.quantity_on_hand, 0)::float8 as on_hand,
             coalesce(i.reserved_quantity, 0)::float8 as reserved,
             coalesce(i.quantity_on_hand, 0) - coalesce(i.reserved_quantity, 0) as available,
             coalesce(i.damaged_quantity, 0)::float8 as damaged,
             coalesce(p.cost_price::float8 * i.quantity_on_hand, 0) as value
      from products p
      cross join warehouses w
      left join inventory i on i.product_id = p.id and i.warehouse_id = w.id and i.variant_id is null
      where p.organization_id = ${ctx.user.organizationId} and w.organization_id = ${ctx.user.organizationId}
        and p.deleted_at is null and w.deleted_at is null and p.status = 'active'
      order by p.sku, w.code
    `);
    const rows = (result as unknown as { rows?: unknown[] }).rows ?? (result as unknown as unknown[]);
    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("inventory.write");
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const kind = body?.kind;

    if (kind === "transfer") {
      const parsed = transferCreateSchema.parse(body);
      const db = getDb();
      await db.transaction(async (tx) => {
        for (const line of parsed.lines) {
          await applyTransfer(tx, ctx.user.organizationId, ctx.user.userId, parsed.fromWarehouseId, parsed.toWarehouseId, line.productId, line.quantity);
        }
      });
      await logAudit(auditCtx(ctx), "inventory.transferred", "inventory", undefined, {
        from: parsed.fromWarehouseId,
        to: parsed.toWarehouseId,
        lines: parsed.lines.length
      });
      return jsonOk({ ok: true });
    }

    if (kind === "adjust") {
      const parsed = inventoryAdjustSchema.parse(body);
      const db = getDb();
      await db.transaction(async (tx) => {
        await adjustInventory(tx, auditCtx(ctx), parsed.productId, parsed.warehouseId, parsed.type, parsed.quantity, parsed.reason);
      });
      await logAudit(auditCtx(ctx), "inventory.adjusted", "inventory", parsed.productId, {
        warehouse: parsed.warehouseId,
        type: parsed.type,
        quantity: parsed.quantity,
        reason: parsed.reason ?? null
      });
      return jsonOk({ ok: true });
    }

    return Response.json({ error: "Unknown inventory operation" }, { status: 400 });
  } catch (err) {
    return errorResponse(err);
  }
}

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

async function applyTransfer(
  tx: Tx,
  organizationId: string,
  userId: string,
  fromWarehouseId: string,
  toWarehouseId: string,
  productId: string,
  quantity: number
) {
  const ctx = { organizationId, userId };
  await applyMovement(tx, ctx, {
    productId,
    warehouseId: fromWarehouseId,
    type: "transfer_out",
    quantity,
    referenceType: "transfer",
    reason: "Stock transfer out"
  });
  await applyMovement(tx, ctx, {
    productId,
    warehouseId: toWarehouseId,
    type: "transfer_in",
    quantity,
    referenceType: "transfer",
    reason: "Stock transfer in"
  });
}
