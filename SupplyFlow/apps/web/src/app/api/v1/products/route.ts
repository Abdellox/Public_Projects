import { schema } from "@supplyflow/database";
import { productCreateSchema, productUpdateSchema } from "@supplyflow/validation";
import { makeCreateHandler, makeListHandler, type CrudConfig } from "@/lib/server/crud";

const config: CrudConfig = {
  table: schema.products,
  entity: "product",
  readPermission: "products.read",
  writePermission: "products.write",
  createSchema: productCreateSchema,
  updateSchema: productUpdateSchema,
  searchColumns: [schema.products.sku, schema.products.name],
  orderBy: schema.products.sku,
  softDelete: true
};

export const GET = makeListHandler(config);
export const POST = makeCreateHandler(config);
