import type { BaseRecord, Money, Id, IsoDateTime } from './primitives';
import type { WorkflowStatus } from './workflow';

/**
 * Sales / CRM entities.
 *
 * Customers and suppliers are PartyRoles (see party.ts); a Quote / SalesOrder
 * references a party id plus role. Products reference the canonical catalog.
 */

export interface Lead extends BaseRecord {
  companyPartyId?: Id;
  contactId?: Id;
  source?: LeadSource;
  stage: LeadStage;
  assignedToId?: Id;
}

export type LeadSource = 'web' | 'referral' | 'cold' | 'event' | 'other';

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Opportunity extends BaseRecord {
  name: string;
  customerPartyId: Id;
  amount: Money;
  stage: OpportunityStage;
  probability: number;
  expectedCloseAt?: IsoDateTime;
  assignedToId?: Id;
}

export type OpportunityStage =
  | 'prospecting'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

/** A quotation (proposal) presented to a customer. */
export interface Quote extends BaseRecord {
  number: string;
  customerPartyId: Id;
  opportunityId?: Id;
  currency: string;
  lineItems: QuoteLine[];
  total: number;
  status: WorkflowStatus;
  validUntil?: IsoDateTime;
}

export interface QuoteLine {
  id: string;
  productId?: Id;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** A sales order placed by a customer. */
export interface SalesOrder extends BaseRecord {
  number: string;
  customerPartyId: Id;
  warehouseId?: Id;
  currency: string;
  lineItems: SalesOrderLine[];
  total: number;
  status: WorkflowStatus;
}

export interface SalesOrderLine {
  id: string;
  productId?: Id;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
