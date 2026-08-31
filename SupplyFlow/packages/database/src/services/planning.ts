import { and, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { getDb, schema, num } from "../index";
import type { PlanningRow, StockPosition, StockRisk } from "@supplyflow/types";

const OPEN_INBOUND_STATUSES = ["pending", "in_transit", "arrived"] as const;
const OPEN_PO_STATUSES = ["sent", "confirmed", "partially_received"] as const;

export interface PositionInput {
  onHand: number;
  reserved: number;
  openAsnQty: number;
  openPoQty: number;
  forecastMonthlyDemand: number | null;
  trailingShippedUnits: number;
  minStock: number | null;
  reorderPoint: number | null;
  reorderQuantity: number | null;
}

/**
 * Pure planning math: projected availability, risk classification and reorder suggestion.
 * incoming = max(open ASN qty, open PO qty) so the same replenishment is not double-counted.
 */
export function computeStockPosition(input: PositionInput): StockPosition {
  const onHand = input.onHand;
  const reserved = input.reserved;
  const incoming = Math.max(input.openAsnQty, input.openPoQty);
  const monthlyDemand = input.forecastMonthlyDemand && input.forecastMonthlyDemand > 0 ? input.forecastMonthlyDemand : input.trailingShippedUnits;
  const dailyDemand = monthlyDemand / 30;
  const available = onHand - reserved;
  const projected = available + incoming - monthlyDemand;

  const minStock = input.minStock ?? 0;
  const reorderPoint = input.reorderPoint ?? minStock;
  let risk: StockRisk;
  if (available <= 0) risk = "out_of_stock";
  else if (projected <= 0 || onHand < minStock) risk = "critical";
  else if (available < reorderPoint) risk = "low";
  else risk = "healthy";

  let recommendedOrderQty: number | null = null;
  if (risk !== "healthy") {
    const target = Math.max(reorderPoint, minStock * 2 > reorderPoint ? minStock * 2 : reorderPoint);
    const base = input.reorderQuantity && input.reorderQuantity > 0 ? Math.max(input.reorderQuantity, target - projected) : target - projected;
    recommendedOrderQty = Math.ceil(Math.max(base, 0));
  }

  return {
    onHand,
    reserved,
    incoming,
    available,
    projected,
    reorderPoint,
    risk,
    daysOfCover: dailyDemand > 0 ? Math.floor(available / dailyDemand) : null,
    recommendedOrderQty
  };
}

export async function computePlanning(organizationId: string): Promise<PlanningRow[]> {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [products, invAgg, incomingAgg, poOpenAgg, forecasts, suppliers] = await Promise.all([
    db.select({
      id: schema.products.id,
      sku: schema.products.sku,
      name: schema.products.name,
      supplierId: schema.products.primarySupplierId,
      leadTimeDays: schema.products.leadTimeDays,
      minStock: schema.products.minStock,
      reorderPoint: schema.products.reorderPoint,
      reorderQuantity: schema.products.reorderQuantity
    }).from(schema.products).where(and(eq(schema.products.organizationId, organizationId), isNull(schema.products.deletedAt), eq(schema.products.status, "active"))),
    db.select({
      productId: schema.inventory.productId,
      onHand: sql<number>`sum(${schema.inventory.quantityOnHand})`,
      reserved: sql<number>`sum(${schema.inventory.reservedQuantity})`
    }).from(schema.inventory)
      .innerJoin(schema.warehouses, eq(schema.warehouses.id, schema.inventory.warehouseId))
      .where(eq(schema.inventory.organizationId, organizationId))
      .groupBy(schema.inventory.productId),
    db.select({
      productId: schema.inboundShipmentLines.productId,
      expected: sql<number>`greatest(sum(${schema.inboundShipmentLines.quantityExpected} - ${schema.inboundShipmentLines.quantityReceived}), 0)`
    }).from(schema.inboundShipmentLines)
      .innerJoin(schema.inboundShipments, eq(schema.inboundShipments.id, schema.inboundShipmentLines.shipmentId))
      .where(and(
        eq(schema.inboundShipments.organizationId, organizationId),
        isNull(schema.inboundShipments.deletedAt),
        inArray(schema.inboundShipments.status, [...OPEN_INBOUND_STATUSES])
      ))
      .groupBy(schema.inboundShipmentLines.productId),
    db.select({
      productId: schema.purchaseOrderLines.productId,
      open: sql<number>`greatest(sum(${schema.purchaseOrderLines.quantity} - ${schema.purchaseOrderLines.quantityReceived}), 0)`
    }).from(schema.purchaseOrderLines)
      .innerJoin(schema.purchaseOrders, eq(schema.purchaseOrders.id, schema.purchaseOrderLines.purchaseOrderId))
      .where(and(
        eq(schema.purchaseOrders.organizationId, organizationId),
        isNull(schema.purchaseOrders.deletedAt),
        inArray(schema.purchaseOrders.status, [...OPEN_PO_STATUSES])
      ))
      .groupBy(schema.purchaseOrderLines.productId),
    db.select({
      productId: schema.demandForecasts.productId,
      demand: sql<number>`coalesce(sum(${schema.demandForecasts.quantity} * greatest(${schema.demandForecasts.periodEnd}::date - ${schema.demandForecasts.periodStart}::date + 1, 1) / 30.0), 0)`,
      earliestEnd: sql<string | null>`min(${schema.demandForecasts.periodEnd})`
    }).from(schema.demandForecasts)
      .where(and(eq(schema.demandForecasts.organizationId, organizationId), gte(schema.demandForecasts.periodEnd, today)))
      .groupBy(schema.demandForecasts.productId),
    db.select({ id: schema.suppliers.id, name: schema.suppliers.name }).from(schema.suppliers).where(eq(schema.suppliers.organizationId, organizationId))
  ]);

  // Trailing 30-day shipped demand as fallback signal
  const since = new Date(Date.now() - 30 * 86400000);
  const shippedAgg = await db.select({
    productId: schema.outboundShipmentLines.productId,
    shipped: sql<number>`coalesce(sum(${schema.outboundShipmentLines.quantity}), 0)`
  }).from(schema.outboundShipmentLines)
    .innerJoin(schema.outboundShipments, eq(schema.outboundShipments.id, schema.outboundShipmentLines.shipmentId))
    .where(and(
      eq(schema.outboundShipments.organizationId, organizationId),
      gte(schema.outboundShipments.createdAt, since),
      inArray(schema.outboundShipments.status, ["shipped", "delivered"])
    ))
    .groupBy(schema.outboundShipmentLines.productId);

  const invMap = new Map(invAgg.map((r) => [r.productId, r]));
  const incMap = new Map(incomingAgg.map((r) => [r.productId, num(r.expected)]));
  const poMap = new Map(poOpenAgg.map((r) => [r.productId, num(r.open)]));
  const fcMap = new Map(forecasts.map((r) => [r.productId, { monthly: num(r.demand), end: r.earliestEnd }]));
  const shMap = new Map(shippedAgg.map((r) => [r.productId, num(r.shipped)]));
  const supMap = new Map(suppliers.map((s) => [s.id, s.name]));

  return products
    .map((p): PlanningRow => {
      const inv = invMap.get(p.id);
      const position = computeStockPosition({
        onHand: num(inv?.onHand),
        reserved: num(inv?.reserved),
        openAsnQty: incMap.get(p.id) ?? 0,
        openPoQty: poMap.get(p.id) ?? 0,
        forecastMonthlyDemand: fcMap.get(p.id)?.monthly ?? null,
        trailingShippedUnits: shMap.get(p.id) ?? 0,
        minStock: p.minStock,
        reorderPoint: p.reorderPoint,
        reorderQuantity: p.reorderQuantity
      });

      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        supplierId: p.supplierId,
        supplierName: p.supplierId ? supMap.get(p.supplierId) ?? null : null,
        leadTimeDays: p.leadTimeDays ?? 14,
        position
      };
    })
    .sort((a, b) => riskRank(a.position.risk) - riskRank(b.position.risk) || a.sku.localeCompare(b.sku));
}

function riskRank(risk: StockRisk): number {
  return { out_of_stock: 0, critical: 1, low: 2, healthy: 3 }[risk];
}
