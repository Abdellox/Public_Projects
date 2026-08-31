import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@supplyflow/database";
import { warehouseCreateSchema, warehouseUpdateSchema } from "@supplyflow/validation";
import { makeDeleteHandler, makeGetHandler, errorResponse, jsonOk, requirePermission, type CrudConfig } from "@/lib/server/crud";

const config: CrudConfig = {
  table: schema.warehouses,
  entity: "warehouse",
  readPermission: "warehouses.read",
  writePermission: "warehouses.write",
  createSchema: warehouseCreateSchema,
  updateSchema: warehouseUpdateSchema,
  softDelete: true
};

export const GET = makeGetHandler(config, schema.warehouses.id);

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> => {
  try {
    const ctx = await requirePermission("warehouses.write");
    const { id } = await params;
    const parsed = warehouseUpdateSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    if (parsed.isDefault) {
      await db.update(schema.warehouses).set({ isDefault: false }).where(eq(schema.warehouses.organizationId, ctx.user.organizationId));
    }
    const [row] = await db
      .update(schema.warehouses)
      .set(parsed)
      .where(and(eq(schema.warehouses.organizationId, ctx.user.organizationId), eq(schema.warehouses.id, id)))
      .returning();
    if (!row) return Response.json({ error: "Warehouse not found" }, { status: 404 });
    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
};

export const DELETE = makeDeleteHandler(config, schema.warehouses.id);
