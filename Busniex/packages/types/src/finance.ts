import type { BaseRecord, Id, Money, IsoDateTime, CountryCode } from './primitives';
import type { PartyRole } from './party';
import type { WorkflowStatus } from './workflow';

/**
 * Finance module entities.
 *
 * Reuses the canonical Money, Party (via PartyRole) and Workflow types. No
 * duplicated "ERPCompany" or "ERPInvoice" — everything builds on shared types.
 */

export type InvoiceDirection = 'outgoing' | 'incoming';

export interface Invoice extends BaseRecord {
  number: string;
  direction: InvoiceDirection;
  customerPartyId?: Id;
  supplierPartyId?: Id;
  issuedById?: Id;
  currency: string;
  lineItems: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  total: number;
  dueDate: IsoDateTime;
  status: WorkflowStatus;
  /** Legal entity that issued/received the invoice. */
  legalEntityId?: Id;
}

export interface InvoiceLine {
  id: string;
  productId?: Id;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface Payment extends BaseRecord {
  invoiceId: Id;
  amount: Money;
  method: PaymentMethod;
  reference?: string;
  paidAt: IsoDateTime;
}

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'check'
  | 'online'
  | 'other';

export interface Account extends BaseRecord {
  code: string;
  name: string;
  kind: AccountKind;
  currency?: string;
  parentId?: Id;
}

export type AccountKind = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Transaction extends BaseRecord {
  accountId: Id;
  amount: Money;
  direction: 'debit' | 'credit';
  referenceId?: Id;
  ledgerAt: IsoDateTime;
  description?: string;
}

export interface Expense extends BaseRecord {
  amount: Money;
  category?: string;
  occurredAt: IsoDateTime;
  paidById?: Id;
  notes?: string;
}
