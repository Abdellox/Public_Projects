import type { Id, IsoDateTime } from './primitives';
import type { BaseRecord } from './primitives';

/**
 * Audit, Document, Notification and Log types — the shared cross-cutting
 * capabilities each business module relies on.
 */

/** Immutable record of who changed what, when, in which scope. */
export interface AuditLog {
  id: Id;
  tenantId: Id;
  actorUserId?: Id;
  action: string;
  entityType: string;
  entityId: Id;
  /** Optional previous and new value snapshot for changed fields. */
  previousValue?: string;
  newValue?: string;
  /** Scope: which organization / legal entity / org unit the action belongs to. */
  organizationId?: Id;
  legalEntityId?: Id;
  source?: string;
  ipAddress?: string;
  at: IsoDateTime;
}

export interface Document extends BaseRecord {
  docType: DocumentType;
  title: string;
  /** The entity the document is attached to (reusable across modules). */
  refEntityType: string;
  refEntityId: Id;
  status: DocumentStatus;
  version: number;
  retentionDays?: number;
  files: FileRef[];
}

export type DocumentType =
  | 'invoice'
  | 'contract'
  | 'purchase_order'
  | 'sales_order'
  | 'employee'
  | 'compliance'
  | 'approval'
  | 'attachment'
  | 'other';

export type DocumentStatus = 'draft' | 'active' | 'archived' | 'deleted';

export interface FileRef {
  id: Id;
  name: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedById?: Id;
}

export interface Notification {
  id: Id;
  tenantId: Id;
  userId: Id;
  title: string;
  body?: string;
  type: NotificationType;
  readAt?: IsoDateTime;
  at: IsoDateTime;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'approval'
  | 'comment'
  | 'system';

export interface DomainEventRecord {
  id: Id;
  tenantId: Id;
  type: string;
  aggregateType: string;
  aggregateId: Id;
  payload: string;
  at: IsoDateTime;
}
