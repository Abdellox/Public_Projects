export type PoStatus = "draft" | "sent" | "confirmed" | "partially_received" | "received" | "cancelled";
export type ShipmentStatus = "pending" | "in_transit" | "arrived" | "completed" | "cancelled";
export type CustomerOrderStatus = "draft" | "confirmed" | "processing" | "partially_shipped" | "shipped" | "delivered" | "cancelled";
export type OutboundStatus = "pending" | "picking" | "packed" | "shipped" | "delivered" | "cancelled";
export type MovementType = "receipt" | "shipment" | "transfer_in" | "transfer_out" | "adjustment" | "return_customer" | "return_supplier" | "damage";
export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";
export type Priority = "low" | "medium" | "high" | "urgent";

export const PO_STATUSES: PoStatus[] = ["draft", "sent", "confirmed", "partially_received", "received", "cancelled"];
export const SHIPMENT_STATUSES: ShipmentStatus[] = ["pending", "in_transit", "arrived", "completed", "cancelled"];
export const CUSTOMER_ORDER_STATUSES: CustomerOrderStatus[] = ["draft", "confirmed", "processing", "partially_shipped", "shipped", "delivered", "cancelled"];
export const OUTBOUND_STATUSES: OutboundStatus[] = ["pending", "picking", "packed", "shipped", "delivered", "cancelled"];

export type StockRisk = "healthy" | "low" | "critical" | "out_of_stock";

export interface StockPosition {
  onHand: number;
  reserved: number;
  incoming: number;
  available: number;
  projected: number;
  reorderPoint: number | null;
  risk: StockRisk;
  daysOfCover: number | null;
  recommendedOrderQty: number | null;
}

export interface PlanningRow {
  productId: string;
  sku: string;
  name: string;
  supplierId: string | null;
  supplierName: string | null;
  leadTimeDays: number;
  position: StockPosition;
}

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "danger";
  type: string;
  title: string;
  detail: string;
  whyItMatters: string;
  suggestedAction: string;
  entityType?: string;
  entityId?: string;
  createdAt?: string;
}
