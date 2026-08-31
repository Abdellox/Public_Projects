import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@supplyflow/database";
import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("inventory.read");
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const db = getDb();

    const conditions = [eq(schema.inventoryMovements.organizationId, ctx.user.organizationId)];
    if (productId) conditions.push(eq(schema.inventoryMovements.productId, productId));

    const rows = await db.select({
      id: schema.inventoryMovements.id,
      productId: schema.inventoryMovements.productId,
      sku: schema.products.sku,
      productName: schema.products.name,
      warehouseCode: schema.warehouses.code,
      type: schema.inventoryMovements.type,
      quantity: schema.inventoryMovements.quantity,
      reason: schema.inventoryMovements.reason,
      referenceType: schema.inventoryMovements.referenceType,
      performedByName: schema.users.name,
      occurredAt: schema.inventoryMovements.occurredAt
    }).from(schema.inventoryMovements)
      .innerJoin(schema.products, eq(schema.products.id, schema.inventoryMovements.productId))
      .innerJoin(schema.warehouses, eq(schema.warehouses.id, schema.inventoryMovements.warehouseId))
      .leftJoin(schema.users, eq(schema.users.id, schema.inventoryMovements.performedBy))
      .where(and(...conditions))
      .orderBy(desc(schema.inventoryMovements.occurredAt))
      .limit(Number(url.searchParams.get("limit") ?? 100));

    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}
