import { and, count, eq, gte, inArray, isNull, lt, sql } from "drizzle-orm";
import { getDb, schema, num } from "../index";
import { computePlanning } from "./planning";
import type { AlertItem } from "@supplyflow/types";

export interface DashboardData {
  kpis: {
    inventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    openPoCount: number;
    committedSpend: number;
    lateInboundCount: number;
    incomingUnits: number;
    fulfillmentRate: number | null;
    atRiskProducts: number;
  };
  topRisk: Array<{ sku: string; name: string; risk: string; projected: number; recommendedOrderQty: number | null; supplierName: string | null }>;
  alerts: AlertItem[];
}

export async function computeDashboard(organizationId: string): Promise<DashboardData> {
  const db = getDb();
  const now = new Date();

  const [planning, valueAgg, poAgg, lateInboundAgg, fulfillment] = await Promise.all([
    computePlanning(organizationId),
    db.select({
      value: sql<string>`coalesce(sum(${schema.inventory.quantityOnHand} * coalesce(${schema.products.costPrice}::float8, 0)), 0)::text`
    }).from(schema.inventory)
      .innerJoin(schema.products, eq(schema.products.id, schema.inventory.productId))
      .where(eq(schema.inventory.organizationId, organizationId)),
    db.select({
      openOrders: sql<number>`count(*)`,
      committed: sql<string>`coalesce(sum(${schema.purchaseOrders.total}), 0)::text`
    }).from(schema.purchaseOrders).where(and(
      eq(schema.purchaseOrders.organizationId, organizationId),
      isNull(schema.purchaseOrders.deletedAt),
      inArray(schema.purchaseOrders.status, ["sent", "confirmed", "partially_received"])
    )),
    db.select({ n: sql<number>`count(*)` }).from(schema.inboundShipments).where(and(
      eq(schema.inboundShipments.organizationId, organizationId),
      isNull(schema.inboundShipments.deletedAt),
      inArray(schema.inboundShipments.status, ["pending", "in_transit", "arrived"]),
      lt(schema.inboundShipments.expectedArrival, now)
    )),
    db.select({
      total: sql<number>`count(distinct ${schema.customerOrders.id})`,
      fulfilled: sql<number>`count(distinct ${schema.customerOrders.id}) filter (where ${schema.customerOrders.requiredDate} is null or min_shipped.min_shipped is null or min_shipped.min_shipped::date <= ${schema.customerOrders.requiredDate})`
    }).from(schema.customerOrders)
      .leftJoin(sql`(select customer_order_id, min(shipped_at) as min_shipped from outbound_shipments where deleted_at is null group by customer_order_id) min_shipped`, sql`min_shipped.customer_order_id = ${schema.customerOrders.id}`)
      .where(and(
        eq(schema.customerOrders.organizationId, organizationId),
        inArray(schema.customerOrders.status, ["shipped", "delivered", "partially_shipped"])
      ))
  ]);

  const lowStock = planning.filter((p) => p.position.risk === "low" || p.position.risk === "critical");
  const outOfStock = planning.filter((p) => p.position.risk === "out_of_stock");
  const incoming = planning.reduce((acc, p) => acc + p.position.incoming, 0);

  let fulfillmentRate: number | null = null;
  const f = fulfillment[0];
  if (f && Number(f.total) > 0) {
    fulfillmentRate = Number(f.fulfilled) / Number(f.total);
  }

  return {
    kpis: {
      inventoryValue: num(valueAgg[0]?.value),
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      openPoCount: Number(poAgg[0]?.openOrders ?? 0),
      committedSpend: num(poAgg[0]?.committed),
      lateInboundCount: Number(lateInboundAgg[0]?.n ?? 0),
      incomingUnits: incoming,
      atRiskProducts: [...lowStock, ...outOfStock].length,
      fulfillmentRate
    },
    topRisk: [...lowStock, ...outOfStock].slice(0, 8).map((p) => ({
      sku: p.sku,
      name: p.name,
      risk: p.position.risk,
      projected: p.position.projected,
      recommendedOrderQty: p.position.recommendedOrderQty,
      supplierName: p.supplierName
    })),
    alerts: []
  };
}
