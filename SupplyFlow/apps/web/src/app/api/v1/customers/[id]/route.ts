import { schema } from "@supplyflow/database";
import { customerCreateSchema, customerUpdateSchema } from "@supplyflow/validation";
import { makeDeleteHandler, makeGetHandler, makeUpdateHandler, type CrudConfig } from "@/lib/server/crud";

const config: CrudConfig = {
  table: schema.customers,
  entity: "customer",
  readPermission: "orders.read",
  writePermission: "orders.write",
  createSchema: customerCreateSchema,
  updateSchema: customerUpdateSchema,
  softDelete: true
};

const idColumn = schema.customers.id;
export const GET = makeGetHandler(config, idColumn);
export const PATCH = makeUpdateHandler(config, idColumn);
export const DELETE = makeDeleteHandler(config, idColumn);
