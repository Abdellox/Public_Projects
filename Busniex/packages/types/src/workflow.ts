import type { BaseRecord, Id, Money, IsoDateTime } from './primitives';

/**
 * Universal Workflow Engine types.
 *
 * Every document (invoice, order, approval, purchase order...) flows through a
 * configurable state machine. A small business can use `Invoice -> Paid`; an
 * enterprise can use a long chain. Both use the same Invoice entity.
 */

export type WorkflowStatus =
  | 'draft'
  | 'review'
  | 'approval'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'archived';

export interface WorkflowTransition {
  from: WorkflowStatus;
  to: WorkflowStatus;
  /** Permission / role required to perform the transition. */
  requiredRole?: string;
  /** Business-rule predicate id that must pass. */
  conditionRuleId?: string;
}

export interface WorkflowDefinition {
  id: Id;
  name: string;
  /** Applies to a document type / transaction type. */
  appliesTo: string;
  /** Optional scoping: legal entity, department, branch, org unit. */
  orgUnitId?: Id;
  transitions: WorkflowTransition[];
  isActive: boolean;
  createdAt: IsoDateTime;
}

/** The current lifecycle state of one document instance. */
export interface WorkflowInstance {
  id: Id;
  workflowDefinitionId: Id;
  /** The audited document (invoice, order, ...). */
  documentType: string;
  documentId: Id;
  status: WorkflowStatus;
  history: WorkflowEvent[];
  updatedAt: IsoDateTime;
}

export interface WorkflowEvent {
  id: Id;
  from: WorkflowStatus;
  to: WorkflowStatus;
  actorUserId: Id;
  note?: string;
  at: IsoDateTime;
}

export interface Approval {
  id: Id;
  workflowInstanceId: Id;
  approverUserId: Id;
  status: 'pending' | 'approved' | 'rejected';
  decidedAt?: IsoDateTime;
  note?: string;
}
