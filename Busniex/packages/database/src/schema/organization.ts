import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
  index,
  primaryKey,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Shared conventions (timestamps, ids) used by every table.
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const tenant = pgTable('tenant', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  ...timestamps,
});

/**
 * Universal Organization Model — the hierarchical org tree.
 * Each node references an optional parent forming the hierarchy.
 */
export const organizationUnit = pgTable(
  'organization_unit',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('organizationUnit'),
    parentId: uuid('parent_id'),
    type: varchar('type', { length: 40 }).notNull(),
    code: varchar('code', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('org_unit_tenant_code').on(t.tenantId, t.code),
    index('org_unit_parent').on(t.parentId),
  ],
);

export const legalEntity = pgTable('legal_entity', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('legalEntity'),
  organizationUnitId: uuid('organization_unit_id').references(() => organizationUnit.id),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 120 }),
  taxId: varchar('tax_id', { length: 120 }),
  country: varchar('country', { length: 2 }).notNull(),
  defaultCurrency: varchar('default_currency', { length: 3 }).notNull(),
  address: text('address'),
  ...timestamps,
});

export const location = pgTable('location', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('location'),
  organizationUnitId: uuid('organization_unit_id').references(() => organizationUnit.id),
  name: varchar('name', { length: 255 }).notNull(),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: varchar('city', { length: 120 }),
  region: varchar('region', { length: 120 }),
  postalCode: varchar('postal_code', { length: 40 }),
  country: varchar('country', { length: 2 }),
  timezone: varchar('timezone', { length: 80 }),
  isWarehouse: boolean('is_warehouse').default(false).notNull(),
  ...timestamps,
});
