import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

/**
 * Global permission catalog. Rows are seeded by migration; `role_permissions`
 * references these keys via FK, so the API can only ever grant catalogued keys.
 */
export const permissions = pgTable("permissions", {
  key: text("key").primaryKey(),
  description: text("description").notNull(),
  group: text("group").notNull().default("general")
});
