import {
  bigserial,
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended']);
export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'suspended',
]);
export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'revoked',
  'expired',
]);

export const users = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    passwordHash: text().notNull(),
    name: text().notNull(),
    avatarUrl: text(),
    jobTitle: text(),
    status: userStatusEnum().notNull().default('active'),
    lastLoginAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [uniqueIndex('users_email_unique').on(t.email)],
);

export const organizations = pgTable(
  'organizations',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull(),
    logoUrl: text(),
    plan: text().notNull().default('open-source'),
    settings: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdByUserId: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [uniqueIndex('organizations_slug_unique').on(t.slug)],
);

export const roles = pgTable(
  'roles',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    key: text().notNull(),
    name: text().notNull(),
    description: text(),
    isSystem: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('roles_org_key_unique').on(t.organizationId, t.key)],
);

export const permissions = pgTable('permissions', {
  key: text().primaryKey(),
  description: text(),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid()
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionKey: text()
      .notNull()
      .references(() => permissions.key, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionKey] })],
);

export const departments = pgTable(
  'departments',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('departments_org_name_unique').on(
      t.organizationId,
      sql`lower(${t.name})`,
    ),
  ],
);

export const teams = pgTable(
  'teams',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    departmentId: uuid()
      .notNull()
      .references(() => departments.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('teams_org_idx').on(t.organizationId),
    uniqueIndex('teams_dept_name_unique').on(
      t.departmentId,
      sql`lower(${t.name})`,
    ),
  ],
);

export const organizationMemberships = pgTable(
  'organization_memberships',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid()
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    departmentId: uuid().references(() => departments.id, {
      onDelete: 'set null',
    }),
    teamId: uuid().references(() => teams.id, { onDelete: 'set null' }),
    jobTitle: text(),
    status: membershipStatusEnum().notNull().default('active'),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('memberships_org_user_unique').on(t.organizationId, t.userId),
    index('memberships_user_idx').on(t.userId),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    revokedAt: timestamp({ withTimezone: true }),
    lastUsedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    ip: text(),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('sessions_token_hash_unique').on(t.tokenHash),
    index('sessions_user_idx').on(t.userId),
    index('sessions_expires_idx').on(t.expiresAt),
  ],
);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text().notNull(),
    roleId: uuid()
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    departmentId: uuid().references(() => departments.id, {
      onDelete: 'set null',
    }),
    teamId: uuid().references(() => teams.id, { onDelete: 'set null' }),
    invitedByUserId: uuid().references(() => users.id, {
      onDelete: 'set null',
    }),
    tokenHash: text().notNull(),
    status: invitationStatusEnum().notNull().default('pending'),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    acceptedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('invitations_token_hash_unique').on(t.tokenHash),
    index('invitations_org_status_idx').on(t.organizationId, t.status),
    index('invitations_email_idx').on(t.email),
  ],
);

/**
 * Immutable trail. organizationId / actorUserId intentionally have no FK
 * so log rows survive record deletion.
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial({ mode: 'number' }).primaryKey(),
    organizationId: uuid(),
    actorUserId: uuid(),
    action: text().notNull(),
    entityType: text(),
    entityId: text(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    ip: text(),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_logs_org_created_idx').on(t.organizationId, t.createdAt)],
);
