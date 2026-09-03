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
} from 'drizzle-orm/pg-core';
import { tenant, timestamps } from './organization';

/**
 * Cross-cutting platform capabilities: workflow engine, audit, documents,
 * notifications and the domain event log. Shared by every module.
 */
export const workflowDefinition = pgTable('workflow_definition', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  name: varchar('name', { length: 160 }).notNull(),
  appliesTo: varchar('applies_to', { length: 80 }).notNull(),
  orgUnitId: uuid('org_unit_id'),
  transitions: jsonb('transitions').$type<unknown[]>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});

export const workflowInstance = pgTable('workflow_instance', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  workflowDefinitionId: uuid('workflow_definition_id').references(() => workflowDefinition.id),
  documentType: varchar('document_type', { length: 80 }).notNull(),
  documentId: uuid('document_id').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  history: jsonb('history').$type<unknown[]>().default([]).notNull(),
  ...timestamps,
});

export const approval = pgTable('approval', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  workflowInstanceId: uuid('workflow_instance_id')
    .notNull()
    .references(() => workflowInstance.id),
  approverUserId: uuid('approver_user_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  note: text('note'),
});

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    actorUserId: uuid('actor_user_id'),
    action: varchar('action', { length: 80 }).notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    previousValue: text('previous_value'),
    newValue: text('new_value'),
    organizationId: uuid('organization_id'),
    legalEntityId: uuid('legal_entity_id'),
    source: varchar('source', { length: 40 }),
    ipAddress: varchar('ip_address', { length: 60 }),
    at: timestamp('at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('audit_entity').on(t.entityType, t.entityId),
    index('audit_tenant_at').on(t.tenantId, t.at),
  ],
);

export const document = pgTable(
  'document',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    entityType: text('entity_type').notNull().default('document'),
    docType: varchar('doc_type', { length: 30 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    refEntityType: varchar('ref_entity_type', { length: 80 }).notNull(),
    refEntityId: uuid('ref_entity_id').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    version: integer('version').notNull().default(1),
    retentionDays: integer('retention_days'),
    ...timestamps,
  },
  (t) => [index('document_ref').on(t.refEntityType, t.refEntityId)],
);

export const fileRef = pgTable('file_ref', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  documentId: uuid('document_id').references(() => document.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storageKey: varchar('storage_key', { length: 255 }).notNull(),
  uploadedById: uuid('uploaded_by_id'),
});

export const notification = pgTable(
  'notification',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    userId: uuid('user_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    type: varchar('type', { length: 30 }).notNull().default('info'),
    readAt: timestamp('read_at', { withTimezone: true }),
    at: timestamp('at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('notification_user').on(t.userId, t.readAt)],
);

export const domainEventLog = pgTable('domain_event_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  type: varchar('type', { length: 120 }).notNull(),
  aggregateType: varchar('aggregate_type', { length: 80 }).notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  payload: jsonb('payload'),
  at: timestamp('at', { withTimezone: true }).defaultNow().notNull(),
});
