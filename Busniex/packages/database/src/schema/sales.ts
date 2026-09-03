import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  boolean,
  numeric,
  integer,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { tenant, timestamps } from './organization';
import { party } from './party';
import { product } from './catalog';

/**
 * Sales / CRM. Customers and suppliers are party roles; these tables only
 * capture sales-specific lifecycle data.
 */
export const lead = pgTable('lead', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('lead'),
  companyPartyId: uuid('company_party_id').references(() => party.id),
  contactId: uuid('contact_id'),
  source: varchar('source', { length: 30 }).notNull().default('other'),
  stage: varchar('stage', { length: 30 }).notNull().default('new'),
  assignedToId: uuid('assigned_to_id'),
  ...timestamps,
});

export const opportunity = pgTable('opportunity', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('opportunity'),
  name: varchar('name', { length: 255 }).notNull(),
  customerPartyId: uuid('customer_party_id')
    .notNull()
    .references(() => party.id),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  stage: varchar('stage', { length: 30 }).notNull().default('prospecting'),
  probability: integer('probability').notNull().default(0),
  expectedCloseAt: varchar('expected_close_at', { length: 40 }),
  assignedToId: uuid('assigned_to_id'),
  ...timestamps,
});

export const quote = pgTable('quote', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('quote'),
  number: varchar('number', { length: 60 }).notNull(),
  customerPartyId: uuid('customer_party_id')
    .notNull()
    .references(() => party.id),
  opportunityId: uuid('opportunity_id').references(() => opportunity.id),
  currency: varchar('currency', { length: 3 }).notNull(),
  total: numeric('total').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  validUntil: varchar('valid_until', { length: 40 }),
  ...timestamps,
});

export const quoteLine = pgTable('quote_line', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quote.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => product.id),
  description: text('description').notNull(),
  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  lineTotal: numeric('line_total').notNull(),
});

export const salesOrder = pgTable('sales_order', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('order'),
  number: varchar('number', { length: 60 }).notNull(),
  customerPartyId: uuid('customer_party_id')
    .notNull()
    .references(() => party.id),
  warehouseId: uuid('warehouse_id'),
  currency: varchar('currency', { length: 3 }).notNull(),
  total: numeric('total').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  ...timestamps,
});

export const salesOrderLine = pgTable('sales_order_line', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => salesOrder.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => product.id),
  description: text('description').notNull(),
  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  lineTotal: numeric('line_total').notNull(),
});
