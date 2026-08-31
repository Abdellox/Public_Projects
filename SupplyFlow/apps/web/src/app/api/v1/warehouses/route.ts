import { eq } from "drizzle-orm";
import { getDb, schema } from "@supplyflow/database";
import { warehouseCreateSchema, warehouseUpdateSchema } from "@supplyflow/validation";
import { makeListHandler, errorResponse, jsonOk, requirePermission, type CrudConfig } from "@/lib/server/crud";

const config: CrudConfig = {
  table: schema.warehouses,
  entity: "warehouse",
  readPermission: "warehouses.read",
  writePermission: "warehouses.write",
  createSchema: warehouseCreateSchema,
  updateSchema: warehouseUpdateSchema,
  searchColumns: [schema.warehouses.name, schema.warehouses.code],
  orderBy: schema.warehouses.code,
  softDelete: true
};

export const GET = makeListHandler(config);

export const POST = async (request: Request): Promise<Response> => {
  try {
    const ctx = await requirePermission("warehouses.write");
    const parsed = warehouseCreateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    if (parsed.isDefault) {
      await db.update(schema.warehouses).set({ isDefault: false }).where(eq(schema.warehouses.organizationId, ctx.user.organizationId));
    }
    const existingCount = await db.select({ id: schema.warehouses.id }).from(schema.warehouses).where(eq(schema.warehouses.organizationId, ctx.user.organizationId)).limit(1);
    const [row] = await db.insert(schema.warehouses).values({
      ...parsed,
      isDefault: parsed.isDefault || existingCount.length === 0,
      organizationId: ctx.user.organizationId
    }).returning();
    return jsonOk({ data: row }, 201);
  } catch (err) {
    return errorResponse(err);
  }
};
