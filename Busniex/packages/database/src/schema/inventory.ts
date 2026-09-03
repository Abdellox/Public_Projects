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
import { party } from './party';
import { product } from './catalog';
import { location } from './organization';

export const inventoryItem = pgTable(
  'inventory_item',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('inventoryItem'),
    productId: uuid('product_id').references(() => product.id),
    locationId: uuid('location_id').references(() => location.id),
    quantityOnHand: numeric('quantity_on_hand').notNull().default('0'),
    reservedQuantity: numeric('reserved_quantity').notNull().default('0'),
    availableQuantity: numeric('available_quantity').notNull().default('0'),
    ...timestamps,
  },
  (t) => [index('inventory_product_location').on(t.productId, t.locationId)],
);

export const stockMovement = pgTable('stock_movement', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('stockMovement'),
  productId: uuid('product_id').references(() => product.id),
  locationId: uuid('location_id').references(() => location.id),
  quantity: numeric('quantity').notNull(),
  type: varchar('type', { length: 30 }).notNull(),
  referenceId: uuid('reference_id'),
  at: timestamp('at', { withTimezone: true }).notNull(),
  ...timestamps,
});

export const purchaseOrder = pgTable('purchase_order', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('purchaseOrder'),
  number: varchar('number', { length: 60 }).notNull(),
  supplierPartyId: uuid('supplier_party_id')
    .notNull()
    .references(() => party.id),
  warehouseId: uuid('warehouse_id').references(() => location.id),
  currency: varchar('currency', { length: 3 }).notNull(),
  total: numeric('total').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  ...timestamps,
});

export const purchaseOrderLine = pgTable('purchase_order_line', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => purchaseOrder.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => product.id),
  description: text('description').notNull(),
  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  lineTotal: numeric('line_total').notNull(),
});

export const posOrder = pgTable('pos_order', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('posOrder'),
  number: varchar('number', { length: 60 }).notNull(),
  customerPartyId: uuid('customer_party_id').references(() => party.id),
  locationId: uuid('location_id').references(() => location.id),
  currency: varchar('currency', { length: 3 }).notNull(),
  total: numeric('total').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  ...timestamps,
});

export const posOrderLine = pgTable('pos_order_line', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => posOrder.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => product.id),
  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  lineTotal: numeric('line_total').notNull(),
});
