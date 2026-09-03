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
 * Universal Finance. The Invoice entity is shared by small and enterprise
 * workflows alike — only the workflow instance differs.
 */
export const invoice = pgTable(
  'invoice',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('invoice'),
    number: varchar('number', { length: 60 }).notNull(),
    direction: varchar('direction', { length: 16 }).notNull().default('outgoing'),
    customerPartyId: uuid('customer_party_id').references(() => party.id),
    supplierPartyId: uuid('supplier_party_id').references(() => party.id),
    legalEntityId: uuid('legal_entity_id'),
    currency: varchar('currency', { length: 3 }).notNull(),
    subtotal: numeric('subtotal').notNull(),
    taxAmount: numeric('tax_amount').notNull(),
    total: numeric('total').notNull(),
    dueDate: varchar('due_date', { length: 40 }),
    status: varchar('status', { length: 30 }).notNull().default('draft'),
    ...timestamps,
  },
  (t) => [unique('invoice_tenant_number').on(t.tenantId, t.number)],
);

export const invoiceLine = pgTable('invoice_line', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoice.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => product.id),
  description: text('description').notNull(),
  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  taxRate: numeric('tax_rate').notNull().default('0'),
  lineTotal: numeric('line_total').notNull(),
});

export const payment = pgTable('payment', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('payment'),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoice.id),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  method: varchar('method', { length: 30 }).notNull(),
  reference: text('reference'),
  paidAt: varchar('paid_at', { length: 40 }),
  ...timestamps,
});

export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('account'),
  code: varchar('code', { length: 30 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  kind: varchar('kind', { length: 20 }).notNull(),
  currency: varchar('currency', { length: 3 }),
  parentId: uuid('parent_id'),
  ...timestamps,
});

export const transaction = pgTable('transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('transaction'),
  accountId: uuid('account_id')
    .notNull()
    .references(() => account.id),
  amount: numeric('amount').notNull(),
  direction: varchar('direction', { length: 8 }).notNull(),
  referenceId: uuid('reference_id'),
  ledgerAt: varchar('ledger_at', { length: 40 }),
  description: text('description'),
  ...timestamps,
});
