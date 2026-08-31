import { schema } from "@supplyflow/database";
import { supplierCreateSchema, supplierUpdateSchema } from "@supplyflow/validation";
import { makeCreateHandler, makeListHandler, type CrudConfig } from "@/lib/server/crud";

const config: CrudConfig = {
  table: schema.suppliers,
  entity: "supplier",
  readPermission: "suppliers.read",
  writePermission: "suppliers.write",
  createSchema: supplierCreateSchema,
  updateSchema: supplierUpdateSchema,
  searchColumns: [schema.suppliers.name, schema.suppliers.code, schema.suppliers.email],
  orderBy: schema.suppliers.name,
  softDelete: true
};

export const GET = makeListHandler(config);
export const POST = makeCreateHandler(config);
