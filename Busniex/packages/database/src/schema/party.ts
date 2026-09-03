import {
  pgTable,
  text,
  uuid,
  timestamp,
  varchar,
  boolean,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { tenant, timestamps } from './organization';

/**
 * Universal Party model.
 *
 * One canonical `party` table holds every counterparty. Roles (customer,
 * supplier, partner, employee, lead...) live in `party_role`; no duplicated
 * per-module customer tables.
 */
export const party = pgTable(
  'party',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('party'),
    kind: varchar('kind', { length: 16 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    emails: jsonb('emails').$type<{ address: string; isPrimary: boolean }[]>().default([]).notNull(),
    phones: jsonb('phones').$type<{ number: string; isPrimary: boolean }[]>().default([]).notNull(),
    addresses: jsonb('addresses').$type<unknown[]>().default([]).notNull(),
    ...timestamps,
  },
  (t) => [index('party_tenant_name').on(t.tenantId, t.name)],
);

export const partyRole = pgTable(
  'party_role',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('partyRole'),
    partyId: uuid('party_id')
      .notNull()
      .references(() => party.id),
    roleType: varchar('role_type', { length: 30 }).notNull(),
    orgUnitId: uuid('org_unit_id'),
    ...timestamps,
  },
  (t) => [unique('party_role_unique').on(t.partyId, t.roleType, t.orgUnitId)],
);

export const contact = pgTable(
  'contact',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('contact'),
    partyId: uuid('party_id').references(() => party.id),
    organizationPartyId: uuid('organization_party_id'),
    firstName: varchar('first_name', { length: 120 }).notNull(),
    lastName: varchar('last_name', { length: 120 }).notNull(),
    title: varchar('title', { length: 120 }),
    emails: jsonb('emails')
      .$type<{ address: string; isPrimary: boolean }[]>()
      .default([])
      .notNull(),
    phones: jsonb('phones').$type<{ number: string; isPrimary: boolean }[]>().default([]).notNull(),
    ...timestamps,
  },
  (t) => [index('contact_tenant_name').on(t.tenantId, t.lastName, t.firstName)],
);

export const employee = pgTable('employee', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  entityType: text('entity_type').notNull().default('employee'),
  personPartyId: uuid('person_party_id')
    .notNull()
    .references(() => party.id),
  employeeNumber: varchar('employee_number', { length: 60 }).notNull(),
  hireDate: varchar('hire_date', { length: 30 }),
  departmentId: uuid('department_id'),
  jobTitle: varchar('job_title', { length: 160 }),
  ...timestamps,
});
