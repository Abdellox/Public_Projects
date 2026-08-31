import { schema } from "@supplyflow/database";
import { productCreateSchema, productUpdateSchema } from "@supplyflow/validation";
import { makeDeleteHandler, makeGetHandler, makeUpdateHandler, type CrudConfig } from "@/lib/server/crud";

const config: CrudConfig = {
  table: schema.products,
  entity: "product",
  readPermission: "products.read",
  writePermission: "products.write",
  createSchema: productCreateSchema,
  updateSchema: productUpdateSchema,
  softDelete: true
};

const idColumn = schema.products.id;
export const GET = makeGetHandler(config, idColumn);
export const PATCH = makeUpdateHandler(config, idColumn);
export const DELETE = makeDeleteHandler(config, idColumn);
