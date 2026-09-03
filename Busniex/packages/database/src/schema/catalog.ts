import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  boolean,
  numeric,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { tenant, timestamps } from './organization';

/**
 * Universal Catalog. One canonical `product` table shared by Sales, POS,
 * Inventory, Procurement and Accounting. Module specific behaviour is added by
 * config tables, not duplicated product entities.
 */
export const product = pgTable(
  'product',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('product'),
    code: varchar('code', { length: 120 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    categoryId: uuid('category_id'),
    kind: varchar('kind', { length: 16 }).notNull().default('product'),
    uom: varchar('uom', { length: 40 }),
    ...timestamps,
  },
  (t) => [unique('product_tenant_code').on(t.tenantId, t.code)],
);

export const productConfig = pgTable('product_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  isSellable: boolean('is_sellable').default(true).notNull(),
  isStockable: boolean('is_stockable').default(false).notNull(),
  isService: boolean('is_service').default(false).notNull(),
  subscription: boolean('subscription').default(false).notNull(),
  reorderLevel: numeric('reorder_level'),
  trackBySerial: boolean('track_by_serial').default(false).notNull(),
  incomeAccountId: uuid('income_account_id'),
  expenseAccountId: uuid('expense_account_id'),
  taxCode: varchar('tax_code', { length: 40 }),
});

export const priceList = pgTable('price_list', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  name: varchar('name', { length: 160 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
});

export const priceListEntry = pgTable('price_list_entry', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id),
  priceListId: uuid('price_list_id')
    .notNull()
    .references(() => priceList.id),
  currency: varchar('currency', { length: 3 }).notNull(),
  unitPrice: numeric('unit_price').notNull(),
});
