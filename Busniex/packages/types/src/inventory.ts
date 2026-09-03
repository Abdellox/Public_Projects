import type { BaseRecord, Money, Id, IsoDateTime } from './primitives';
import type { WorkflowStatus } from './workflow';

/**
 * Inventory & Procurement entities.
 *
 * Stock lives in Locations flagged as warehouses. Products are the canonical
 * catalog entries; inventory simply tracks quantities on hand against them.
 */

export interface InventoryItem extends BaseRecord {
  productId: Id;
  locationId: Id;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockMovement extends BaseRecord {
  productId: Id;
  locationId: Id;
  quantity: number;
  type: StockMovementType;
  referenceId?: Id;
  at: IsoDateTime;
}

export type StockMovementType = 'in' | 'out' | 'transfer' | 'adjustment' | 'reserve' | 'release';

export interface PurchaseOrder extends BaseRecord {
  number: string;
  supplierPartyId: Id;
  warehouseId?: Id;
  currency: string;
  lineItems: PurchaseOrderLine[];
  total: number;
  status: WorkflowStatus;
}

export interface PurchaseOrderLine {
  id: string;
  productId?: Id;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** A goods receipt against a purchase order. */
export interface GoodsReceipt extends BaseRecord {
  purchaseOrderId: Id;
  warehouseId: Id;
  at: IsoDateTime;
}

/** A point-of-sale sale session / receipt line. */
export interface PosOrder extends BaseRecord {
  number: string;
  customerPartyId?: Id;
  locationId: Id;
  lineItems: PosLine[];
  total: Money;
  status: WorkflowStatus;
}

export interface PosLine {
  id: string;
  productId: Id;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
