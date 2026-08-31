import { and, eq, gt, inArray, isNull, lt, sql } from "drizzle-orm";
import { getDb, schema } from "../index";
import { computePlanning } from "./planning";
import type { AlertItem } from "@supplyflow/types";

export async function computeAlerts(organizationId: string): Promise<AlertItem[]> {
  const db = getDb();
  const now = new Date();
  const alerts: AlertItem[] = [];

  // Stock risk alerts from planning engine
  const planning = await computePlanning(organizationId);
  for (const row of planning) {
    if (row.position.risk === "healthy") continue;
    const risk = row.position.risk;
    const days = row.position.daysOfCover;
    alerts.push({
      id: `stock-${row.productId}`,
      severity: risk === "out_of_stock" ? "danger" : risk === "critical" ? "danger" : "warning",
      type: `stock.${risk}`,
      title:
        risk === "out_of_stock"
          ? `${row.name} is out of stock`
          : risk === "critical"
            ? `${row.name} will run out${days !== null ? ` in ~${days} days` : " soon"}`
            : `${row.name} is below reorder point`,
      detail: `On hand ${row.position.onHand}, reserved ${row.position.reserved}, incoming ${row.position.incoming} → projected ${row.position.projected}.`,
      whyItMatters:
        risk === "low"
          ? "Stock has dropped below the reorder point; a replenishment lead time of ~" + row.leadTimeDays + " days means waiting longer risks stockouts."
          : "At current reserved plus forecast demand you cannot fulfil expected orders.",
      suggestedAction:
        row.position.recommendedOrderQty
          ? `Review the recommended reorder of ${row.position.recommendedOrderQty} units from ${row.supplierName ?? "the primary supplier"} in Planning.`
          : "Review the supply plan for this product.",
      entityType: "product",
      entityId: row.productId
    });
  }

  // Late inbound shipments
  const lateInbound = await db.select({
    id: schema.inboundShipments.id,
    number: schema.inboundShipments.number,
    expectedArrival: schema.inboundShipments.expectedArrival,
    supplierName: schema.suppliers.name,
    poNumber: schema.purchaseOrders.number
  }).from(schema.inboundShipments)
    .innerJoin(schema.suppliers, eq(schema.suppliers.id, schema.inboundShipments.supplierId))
    .leftJoin(schema.purchaseOrders, eq(schema.purchaseOrders.id, schema.inboundShipments.purchaseOrderId))
    .where(and(
      eq(schema.inboundShipments.organizationId, organizationId),
      isNull(schema.inboundShipments.deletedAt),
      inArray(schema.inboundShipments.status, ["pending", "in_transit", "arrived"]),
      lt(schema.inboundShipments.expectedArrival, now)
    ));

  for (const s of lateInbound) {
    const daysLate = Math.floor((now.getTime() - new Date(s.expectedArrival!).getTime()) / 86400000);
    alerts.push({
      id: `late-inbound-${s.id}`,
      severity: daysLate > 7 ? "danger" : "warning",
      type: "shipment.late_inbound",
      title: `Shipment ${s.number} is ${daysLate} day${daysLate === 1 ? "" : "s"} late`,
      detail: `${s.poNumber ? `For ${s.poNumber} · ` : ""}Supplier ${s.supplierName}; expected arrival was ${new Date(s.expectedArrival!).toLocaleDateString()}.`,
      whyItMatters: "Dependent replenishment plans and any promised customer deliveries relying on this stock are now at risk.",
      suggestedAction: "Contact the supplier for a revised ETA, update the shipment record, and re-check affected products in Planning.",
      entityType: "inbound_shipment",
      entityId: s.id
    });
  }

  // Unconfirmed POs sent long ago
  const stalePos = await db.select({
    id: schema.purchaseOrders.id,
    number: schema.purchaseOrders.number,
    supplierName: schema.suppliers.name,
    sentAt: schema.purchaseOrders.sentAt
  }).from(schema.purchaseOrders)
    .innerJoin(schema.suppliers, eq(schema.suppliers.id, schema.purchaseOrders.supplierId))
    .where(and(
      eq(schema.purchaseOrders.organizationId, organizationId),
      isNull(schema.purchaseOrders.deletedAt),
      eq(schema.purchaseOrders.status, "sent"),
      lt(schema.purchaseOrders.sentAt, new Date(Date.now() - 5 * 86400000))
    ));

  for (const po of stalePos) {
    const days = Math.floor((now.getTime() - new Date(po.sentAt!).getTime()) / 86400000);
    alerts.push({
      id: `stale-po-${po.id}`,
      severity: days > 10 ? "danger" : "info",
      type: "purchasing.unconfirmed",
      title: `${po.number} has not been confirmed for ${days} days`,
      detail: `Sent to ${po.supplierName} on ${new Date(po.sentAt!).toLocaleDateString()} with no confirmation.`,
      whyItMatters: "Unconfirmed orders may silently fail — suppliers sometimes miss emails or reject terms.",
      suggestedAction: "Chase the supplier for confirmation, or cancel and re-source the order.",
      entityType: "purchase_order",
      entityId: po.id
    });
  }

  // Customer orders past required date, not fulfilled
  const todayStr = now.toISOString().slice(0, 10);
  const lateOrders = await db.select({
    id: schema.customerOrders.id,
    number: schema.customerOrders.number,
    customerName: schema.customers.name,
    requiredDate: schema.customerOrders.requiredDate,
    priority: schema.customerOrders.priority
  }).from(schema.customerOrders)
    .innerJoin(schema.customers, eq(schema.customers.id, schema.customerOrders.customerId))
    .where(and(
      eq(schema.customerOrders.organizationId, organizationId),
      isNull(schema.customerOrders.deletedAt),
      inArray(schema.customerOrders.status, ["draft", "confirmed", "processing"]),
      lt(schema.customerOrders.requiredDate, todayStr),
      gt(schema.customerOrders.requiredDate, "1970-01-01")
    ));

  for (const co of lateOrders) {
    alerts.push({
      id: `late-co-${co.id}`,
      severity: co.priority === "urgent" ? "danger" : "warning",
      type: "orders.late_customer_order",
      title: `Order ${co.number} for ${co.customerName} is past its required date`,
      detail: `Required ${new Date(co.requiredDate!).toLocaleDateString()}, status still ${co.priority}.`,
      whyItMatters: "Late fulfillment damages customer relationships and may trigger penalty clauses.",
      suggestedAction: "Check available stock and ship what you can; communicate a revised date to the customer.",
      entityType: "customer_order",
      entityId: co.id
    });
  }

  return alerts.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

function severityRank(s: AlertItem["severity"]): number {
  return { danger: 0, warning: 1, info: 2 }[s];
}

export interface SupplierScorecard {
  supplierId: string;
  name: string;
  shipments: number;
  onTimeRate: number | null;
  averageDelayDays: number | null;
  fillRate: number | null;
  openOrders: number;
  committedValue: string | null;
}

export async function supplierScorecards(organizationId: string): Promise<SupplierScorecard[]> {
  const db = getDb();
  const [supRows, perf] = await Promise.all([
    db.select({ id: schema.suppliers.id, name: schema.suppliers.name }).from(schema.suppliers).where(and(eq(schema.suppliers.organizationId, organizationId), isNull(schema.suppliers.deletedAt))),
    db.select({
      supplierId: schema.inboundShipments.supplierId,
      completed: sql<number>`count(*) filter (where ${schema.inboundShipments.status} = 'completed' and ${schema.inboundShipments.actualArrival} is not null)`,
      onTime: sql<number>`count(*) filter (where ${schema.inboundShipments.status} = 'completed' and ${schema.inboundShipments.actualArrival} <= ${schema.inboundShipments.expectedArrival})`,
      avgDelay: sql<number>`avg(greatest(extract(epoch from (${schema.inboundShipments.actualArrival} - ${schema.inboundShipments.expectedArrival})) / 86400, 0)) filter (where ${schema.inboundShipments.status} = 'completed')`,
      fillNum: sql<number>`sum(${schema.inboundShipmentLines.quantityReceived})`,
      fillDen: sql<number>`sum(${schema.inboundShipmentLines.quantityExpected})`
    }).from(schema.inboundShipments)
      .innerJoin(schema.inboundShipmentLines, eq(schema.inboundShipmentLines.shipmentId, schema.inboundShipments.id))
      .where(and(eq(schema.inboundShipments.organizationId, organizationId), isNull(schema.inboundShipments.deletedAt)))
      .groupBy(schema.inboundShipments.supplierId),
  ]);

  const openPoAgg = await db.select({
    supplierId: schema.purchaseOrders.supplierId,
    openOrders: sql<number>`count(*)`,
    committed: sql<string>`coalesce(sum(${schema.purchaseOrders.total}), 0)::text`
  }).from(schema.purchaseOrders)
    .where(and(
      eq(schema.purchaseOrders.organizationId, organizationId),
      isNull(schema.purchaseOrders.deletedAt),
      inArray(schema.purchaseOrders.status, ["sent", "confirmed", "partially_received"])
    ))
    .groupBy(schema.purchaseOrders.supplierId);

  const perfMap = new Map(perf.map((p) => [p.supplierId, p]));
  const openMap = new Map(openPoAgg.map((o) => [o.supplierId, o]));

  return supRows.map((s) => {
    const p = perfMap.get(s.id);
    const o = openMap.get(s.id);
    const completed = Number(p?.completed ?? 0);
    const onTime = Number(p?.onTime ?? 0);
    return {
      supplierId: s.id,
      name: s.name,
      shipments: completed,
      onTimeRate: completed > 0 ? onTime / completed : null,
      averageDelayDays: p && p.avgDelay !== null ? Number(p.avgDelay) : null,
      fillRate: p && Number(p.fillDen) > 0 ? Number(p.fillNum) / Number(p.fillDen) : null,
      openOrders: Number(o?.openOrders ?? 0),
      committedValue: o?.committed ?? null
    };
  }).sort((a, b) => b.shipments - a.shipments || a.name.localeCompare(b.name));
}
