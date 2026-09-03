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

/**
 * Identity: users, roles and permissions. Centralized authorization used by
 * every module via the @businex/auth package.
 */
export const user = pgTable(
  'app_user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    partyId: uuid('party_id').references(() => party.id),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 500 }).notNull(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (t) => [unique('app_user_tenant_email').on(t.tenantId, t.email)],
);

export const role = pgTable('role', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(),
});

export const userRole = pgTable(
  'user_role',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id),
    orgUnitId: uuid('org_unit_id'),
  },
  (t) => [unique('user_role_unique').on(t.userId, t.roleId, t.orgUnitId)],
);
