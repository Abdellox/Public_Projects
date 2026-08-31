import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema, nextNumber, logAudit, logActivity } from "@supplyflow/database";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

const approveSchema = z.object({
  supplierId: z.string().uuid(),
  warehouseId: z.string().uuid().optional().nullable(),
  expectedDate: z.string().date().optional().nullable(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive()
  })).min(1).max(200)
});

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("purchasing.write");
    const parsed = approveSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    let subtotal = 0;
    const productRows = await db.select({ id: schema.products.id, cost: schema.products.costPrice })
      .from(schema.products)
      .where(eq(schema.products.organizationId, ctx.user.organizationId));
    const costMap = new Map(productRows.map((p) => [p.id, p.cost]));

    const po = await db.transaction(async (tx) => {
      const number = await nextNumber(tx as never, "PO", ctx.user.organizationId);
      for (const item of parsed.items) {
        subtotal += item.quantity * parseFloat(costMap.get(item.productId) ?? "0") || 0;
      }

      const [row] = await tx.insert(schema.purchaseOrders).values({
        organizationId: ctx.user.organizationId,
        number,
        supplierId: parsed.supplierId,
        warehouseId: parsed.warehouseId ?? null,
        status: "draft",
        currency: "USD",
        orderDate: new Date().toISOString().slice(0, 10),
        expectedDate: parsed.expectedDate ?? null,
        buyerId: ctx.user.userId,
        subtotal: subtotal.toFixed(2),
        total: subtotal.toFixed(2),
        notes: "Created from approved reorder recommendation"
      }).returning();

      await tx.insert(schema.purchaseOrderLines).values(
        parsed.items.map((item, i) => ({
          organizationId: ctx.user.organizationId,
          purchaseOrderId: row.id,
          lineNo: i + 1,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: costMap.get(item.productId) ?? "0",
          total: (item.quantity * parseFloat(costMap.get(item.productId) ?? "0")).toFixed(2)
        }))
      );
      return row;
    });

    await logAudit(auditCtx(ctx), "purchase_order.created_from_planning", "purchase_order", po.id, { number: po.number });
    await logActivity(auditCtx(ctx), "purchase_order", po.id, "created", `Draft PO ${po.number} created from reorder recommendation`);
    return jsonOk({ data: po }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
