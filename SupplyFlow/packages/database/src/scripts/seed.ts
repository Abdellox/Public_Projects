import { config } from "dotenv";
config({ path: new URL("../../../../.env", import.meta.url) });

import { randomBytes, scryptSync } from "node:crypto";
import { getDb, schema } from "../index";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString();
};
const dateOnly = (offsetDays: number) => iso(offsetDays).slice(0, 10);

async function main() {
  const db = getDb();
  console.log("Seeding demo organization...");

  const [org] = await db.insert(schema.organizations)
    .values({ name: "Acme Outdoors (Demo)", slug: "acme-demo", currency: "USD", timezone: "UTC" })
    .returning();

  const userRows = await db.insert(schema.users).values([
    { email: "admin@demo.supplyflow.dev", name: "Alex Rivera", passwordHash: hashPassword("admin1234") },
    { email: "maria@demo.supplyflow.dev", name: "Maria Chen", passwordHash: hashPassword("buyer1234") },
    { email: "ken@demo.supplyflow.dev", name: "Ken Osei", passwordHash: hashPassword("wh12345") }
  ]).returning();
  const [admin, buyer, whManager] = userRows;

  await db.insert(schema.memberships).values([
    { organizationId: org.id, userId: admin.id, role: "owner" },
    { organizationId: org.id, userId: buyer.id, role: "buyer" },
    { organizationId: org.id, userId: whManager.id, role: "manager" }
  ]);

  const catRows = await db.insert(schema.categories).values([
    { organizationId: org.id, name: "Footwear", color: "#2563eb" },
    { organizationId: org.id, name: "Apparel", color: "#059669" },
    { organizationId: org.id, name: "Camping Gear", color: "#d97706" },
    { organizationId: org.id, name: "Accessories", color: "#7c3aed" }
  ]).returning();
  const cat = Object.fromEntries(catRows.map((c) => [c.name, c.id]));

  const whRows = await db.insert(schema.warehouses).values([
    { organizationId: org.id, code: "WH-EAST", name: "East Distribution Center", city: "Newark", country: "US", isDefault: true },
    { organizationId: org.id, code: "WH-WEST", name: "West Fulfillment Hub", city: "Portland", country: "US" }
  ]).returning();
  const [east, west] = whRows;

  await db.insert(schema.warehouseLocations).values(
    ["A-01", "A-02", "B-01", "B-02"].flatMap((code) => [
      { organizationId: org.id, warehouseId: east.id, code },
      { organizationId: org.id, warehouseId: west.id, code }
    ])
  );

  const supRows = await db.insert(schema.suppliers).values([
    { organizationId: org.id, code: "SUP-001", name: "Summit Source Co.", email: "sales@summitsource.cn", phone: "+86 755 8899 1200", city: "Shenzhen", country: "CN", paymentTerms: "NET45", defaultLeadTimeDays: 32 },
    { organizationId: org.id, code: "SUP-002", name: "Pacific Textiles Ltd", email: "orders@pacifictextiles.vn", phone: "+84 28 3822 4477", city: "Ho Chi Minh City", country: "VN", paymentTerms: "NET30", defaultLeadTimeDays: 24 },
    { organizationId: org.id, code: "SUP-003", name: "NorthGear GmbH", email: "verkauf@northgear.de", phone: "+49 40 5589 2210", city: "Hamburg", country: "DE", paymentTerms: "NET14", defaultLeadTimeDays: 9 },
    { organizationId: org.id, code: "SUP-004", name: "TrailWorks Supply", email: "hello@trailworks.us", phone: "+1 503 224 8811", city: "Portland", country: "US", paymentTerms: "NET30", defaultLeadTimeDays: 5 }
  ]).returning();
  const sup = Object.fromEntries(supRows.map((s) => [s.code, s.id]));

  type P = { sku: string; name: string; categoryId: string; supplierId: string; cost: number; price: number; min: number; max: number; rop: number; roq: number; lead: number; unit?: string };
  const productDefs: P[] = [
    { sku: "SHOE-TRAIL-40", name: "Trail Runner GTX", categoryId: cat["Footwear"], supplierId: sup["SUP-001"], cost: 42, price: 129, min: 80, max: 600, rop: 150, roq: 400, lead: 32 },
    { sku: "SHOE-HIKE-02", name: "Ridgeline Hiking Boot", categoryId: cat["Footwear"], supplierId: sup["SUP-001"], cost: 58, price: 179, min: 60, max: 400, rop: 120, roq: 300, lead: 32 },
    { sku: "SAND-BCH-11", name: "Coastline Sandal", categoryId: cat["Footwear"], supplierId: sup["SUP-004"], cost: 12, price: 39, min: 100, max: 800, rop: 200, roq: 500, lead: 5 },
    { sku: "JCK-RN-70", name: "Stormshell Rain Jacket", categoryId: cat["Apparel"], supplierId: sup["SUP-002"], cost: 34, price: 119, min: 50, max: 350, rop: 100, roq: 250, lead: 24 },
    { sku: "TEE-MER-33", name: "Merino Trail Tee", categoryId: cat["Apparel"], supplierId: sup["SUP-002"], cost: 11, price: 49, min: 120, max: 900, rop: 300, roq: 700, lead: 24 },
    { sku: "FLC-ZIP-18", name: "Basecamp Fleece Zip", categoryId: cat["Apparel"], supplierId: sup["SUP-002"], cost: 19, price: 69, min: 70, max: 500, rop: 180, roq: 400, lead: 24 },
    { sku: "TENT-DME-4", name: "Dome Tent 4P", categoryId: cat["Camping Gear"], supplierId: sup["SUP-001"], cost: 76, price: 219, min: 25, max: 200, rop: 60, roq: 120, lead: 32 },
    { sku: "SLP-BAG-20", name: "Summit Sleeping Bag -10C", categoryId: cat["Camping Gear"], supplierId: sup["SUP-003"], cost: 64, price: 189, min: 30, max: 250, rop: 70, roq: 150, lead: 12 },
    { sku: "MAT-SLF-09", name: "Ultralight Sleep Mat", categoryId: cat["Camping Gear"], supplierId: sup["SUP-003"], cost: 22, price: 79, min: 60, max: 450, rop: 140, roq: 350, lead: 12 },
    { sku: "STV-CMP-05", name: "Pocket Camp Stove", categoryId: cat["Camping Gear"], supplierId: sup["SUP-004"], cost: 17, price: 59, min: 80, max: 500, rop: 160, roq: 400, lead: 6 },
    { sku: "LMP-HED-77", name: "Beam Headlamp 400lm", categoryId: cat["Accessories"], supplierId: sup["SUP-004"], cost: 8, price: 29, min: 150, max: 1000, rop: 350, roq: 800, lead: 6 },
    { sku: "BTL-STL-50", name: "Insulated Bottle 750ml", categoryId: cat["Accessories"], supplierId: sup["SUP-004"], cost: 7, price: 27, min: 200, max: 1200, rop: 450, roq: 1000, lead: 6 },
    { sku: "SOC-WOL-21", name: "Merino Hiking Socks 3-Pack", categoryId: cat["Accessories"], supplierId: sup["SUP-002"], cost: 6, price: 24, min: 250, max: 1500, rop: 500, roq: 1200, lead: 24 },
    { sku: "CAP-SNY-44", name: "Sunshield Cap", categoryId: cat["Accessories"], supplierId: sup["SUP-002"], cost: 4, price: 19, min: 150, max: 900, rop: 300, roq: 600, lead: 24 }
  ];

  const prodRows = await db.insert(schema.products).values(
    productDefs.map((p) => ({
      organizationId: org.id,
      sku: p.sku,
      name: p.name,
      description: `${p.name} — ${p.sku}`,
      categoryId: p.categoryId,
      primarySupplierId: p.supplierId,
      unit: p.unit ?? "unit",
      costPrice: p.cost.toFixed(2),
      sellingPrice: p.price.toFixed(2),
      minStock: p.min,
      maxStock: p.max,
      reorderPoint: p.rop,
      reorderQuantity: p.roq,
      leadTimeDays: p.lead,
      defaultWarehouseId: east.id
    }))
  ).returning();

  // Inventory: [productIndex, eastOnHand, eastReserved, westOnHand]
  const invPlan: Array<[number, number, number, number]> = [
    [0, 90, 30, 45],
    [1, 210, 40, 95],
    [2, 480, 60, 220],
    [3, 35, 25, 20],
    [4, 640, 90, 310],
    [5, 160, 30, 85],
    [6, 18, 12, 8],
    [7, 75, 15, 40],
    [8, 130, 20, 60],
    [9, 290, 35, 140],
    [10, 95, 40, 30],
    [11, 720, 110, 380],
    [12, 410, 60, 260],
    [13, 240, 45, 130]
  ];
  await db.insert(schema.inventory).values(
    invPlan.flatMap(([pi, eqh, eres, wq]) => [
      { organizationId: org.id, productId: prodRows[pi].id, warehouseId: east.id, quantityOnHand: eqh, reservedQuantity: eres },
      { organizationId: org.id, productId: prodRows[pi].id, warehouseId: west.id, quantityOnHand: wq }
    ])
  );
  await db.insert(schema.inventoryMovements).values(
    invPlan.slice(0, 6).flatMap(([pi, eqh]) => [
      { organizationId: org.id, productId: prodRows[pi].id, warehouseId: east.id, type: "receipt" as const, quantity: eqh, referenceType: "seed", performedBy: whManager.id, occurredAt: iso(-21) },
      { organizationId: org.id, productId: prodRows[pi].id, warehouseId: west.id, type: "receipt" as const, quantity: invPlan[pi]?.[3] ?? 0, referenceType: "seed", performedBy: whManager.id, occurredAt: iso(-21) }
    ])
  );

  // ── Purchase orders ──────────────────────────────────────────────
  const poDefs = [
    { number: "PO-2026-001", supplier: sup["SUP-001"], status: "received" as const, order: -40, expected: -8, lines: [[0, 400, 41.5], [1, 300, 57]] },
    { number: "PO-2026-002", supplier: sup["SUP-002"], status: "partially_received" as const, order: -25, expected: -2, lines: [[4, 700, 10.5], [12, 1200, 5.8], [13, 600, 3.9]] },
    { number: "PO-2026-003", supplier: sup["SUP-003"], status: "confirmed" as const, order: -12, expected: 4, lines: [[7, 150, 63], [8, 350, 21.5]] },
    { number: "PO-2026-004", supplier: sup["SUP-001"], status: "sent" as const, order: -16, expected: 14, lines: [[6, 120, 74], [0, 400, 41.5]] },
    { number: "PO-2026-005", supplier: sup["SUP-004"], status: "draft" as const, order: null, expected: null, lines: [[11, 1000, 6.8], [10, 800, 7.6]] }
  ] as const;

  const poRows = [];
  for (let i = 0; i < poDefs.length; i++) {
    const def = poDefs[i];
    let subtotal = 0;
    for (const [, qty, cost] of def.lines) subtotal += qty * cost;
    const total = subtotal * 1.0;
    const [po] = await db.insert(schema.purchaseOrders).values({
      organizationId: org.id,
      number: def.number,
      supplierId: def.supplier,
      warehouseId: east.id,
      status: def.status,
      currency: "USD",
      orderDate: def.order === null ? null : dateOnly(def.order),
      expectedDate: def.expected === null ? null : dateOnly(def.expected),
      sentAt: def.status === "draft" ? null : iso(def.order ?? -20),
      confirmedAt: ["confirmed", "partially_received", "received"].includes(def.status) ? iso((def.order ?? -20) + 3) : null,
      receivedAt: def.status === "received" ? iso(def.expected ?? -8) : null,
      buyerId: buyer.id,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      notes: i === 3 ? "Expedite requested — peak season build." : null
    }).returning();
    poRows.push(po);

    await db.insert(schema.purchaseOrderLines).values(
      def.lines.map(([pi, qty, cost], li) => ({
        organizationId: org.id,
        purchaseOrderId: po.id,
        lineNo: li + 1,
        productId: prodRows[pi].id,
        quantity: qty,
        quantityReceived: def.status === "received" ? qty : def.status === "partially_received" && pi === 4 ? Math.round(qty * 0.7) : 0,
        unitCost: cost.toFixed(2),
        total: (qty * cost).toFixed(2)
      }))
    );

    if (def.status !== "draft" && i < 4) {
      const st = def.status === "sent" ? "in_transit" : def.status === "confirmed" ? "pending" : "completed";
      await db.insert(schema.inboundShipments).values({
        organizationId: org.id,
        number: `ASN-2026-00${i + 1}`,
        purchaseOrderId: po.id,
        supplierId: def.supplier,
        warehouseId: east.id,
        carrier: i % 2 === 0 ? "Maersk Line" : "DHL Global Forwarding",
        trackingNumber: `MAEU${730000000 + i * 137}`,
        origin: i % 2 === 0 ? "Shenzhen, CN" : "Hamburg, DE",
        departedAt: iso((def.order ?? -20) + 5),
        expectedArrival: iso(def.expected ?? 0),
        actualArrival: st === "completed" ? iso(def.expected ?? -8) : null,
        status: st,
        notes: st === "in_transit" ? "Vessel delayed at Singapore transshipment." : null
      }).returning().then(async ([ship]) => {
        await db.insert(schema.inboundShipmentLines).values(
          def.lines.map(([pi, qty]) => ({
            organizationId: org.id,
            shipmentId: ship.id,
            productId: prodRows[pi].id,
            quantityExpected: qty,
            quantityReceived: st === "completed" ? qty : 0
          }))
        );
      });
    }
  }

  // ── Customers & sales side ───────────────────────────────────────
  const custRows = await db.insert(schema.customers).values([
    { organizationId: org.id, code: "CUS-001", name: "Peak Retail Group", email: "buying@peakretail.com", city: "Chicago", country: "US" },
    { organizationId: org.id, code: "CUS-002", name: "WildPath Outfitters", email: "orders@wildpath.co", city: "Denver", country: "US" },
    { organizationId: org.id, code: "CUS-003", name: "UrbanTrail Stores", email: "purchasing@urbantrail.eu", city: "Rotterdam", country: "NL" }
  ]).returning();

  const coDefs = [
    { number: "SO-2026-101", customer: 0, status: "confirmed" as const, priority: "urgent" as const, order: -3, required: 3, lines: [[0, 60, 126], [3, 40, 116]] },
    { number: "SO-2026-102", customer: 1, status: "processing" as const, priority: "high" as const, order: -6, required: 6, lines: [[6, 24, 215], [9, 50, 57]] },
    { number: "SO-2026-103", customer: 2, status: "shipped" as const, priority: "medium" as const, order: -14, required: -2, lines: [[4, 200, 47]] },
    { number: "SO-2026-104", customer: 0, status: "delivered" as const, priority: "medium" as const, order: -30, required: -12, lines: [[11, 300, 26], [12, 150, 23]] },
    { number: "SO-2026-105", customer: 1, status: "draft" as const, priority: "low" as const, order: null, required: 21, lines: [[7, 40, 182]] }
  ] as const;

  for (let i = 0; i < coDefs.length; i++) {
    const d = coDefs[i];
    let subtotal = 0;
    for (const [, qty, price] of d.lines) subtotal += qty * price;
    const [co] = await db.insert(schema.customerOrders).values({
      organizationId: org.id,
      number: d.number,
      customerId: custRows[d.customer].id,
      warehouseId: i % 2 === 0 ? east.id : west.id,
      status: d.status,
      priority: d.priority,
      currency: "USD",
      orderDate: d.order === null ? null : dateOnly(d.order),
      requiredDate: d.required === null ? null : dateOnly(d.required),
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2),
      salespersonId: buyer.id
    }).returning();

    await db.insert(schema.customerOrderLines).values(
      d.lines.map(([pi, qty, price], li) => ({
        organizationId: org.id,
        customerOrderId: co.id,
        lineNo: li + 1,
        productId: prodRows[pi].id,
        quantity: qty,
        quantityShipped: d.status === "shipped" || d.status === "delivered" ? qty : 0,
        unitPrice: price.toFixed(2),
        total: (qty * price).toFixed(2)
      }))
    );

    if (d.status === "shipped" || d.status === "delivered") {
      await db.insert(schema.outboundShipments).values({
        organizationId: org.id,
        number: `OS-2026-20${i + 1}`,
        customerOrderId: co.id,
        customerId: custRows[d.customer].id,
        warehouseId: co.warehouseId,
        carrier: "UPS Worldwide",
        trackingNumber: `1Z999AA1012${345678 + i}`,
        shippedAt: iso(d.order! + 4),
        expectedDelivery: iso(d.required!),
        actualDelivery: d.status === "delivered" ? iso(d.required!) : null,
        status: d.status === "delivered" ? "delivered" : "shipped"
      });
    }
  }

  // ── Planning inputs & collaboration samples ──────────────────────
  await db.insert(schema.demandForecasts).values([
    { organizationId: org.id, productId: prodRows[0].id, periodStart: dateOnly(0), periodEnd: dateOnly(30), quantity: 180, source: "manual", note: "Spring running season uplift", createdBy: buyer.id },
    { organizationId: org.id, productId: prodRows[3].id, periodStart: dateOnly(0), periodEnd: dateOnly(30), quantity: 90, source: "manual", note: "Rainy forecast Q1", createdBy: buyer.id },
    { organizationId: org.id, productId: prodRows[6].id, periodStart: dateOnly(0), periodEnd: dateOnly(30), quantity: 45, source: "order_based", note: "Based on open quotes", createdBy: buyer.id }
  ]);

  await db.insert(schema.activities).values([
    { organizationId: org.id, entityType: "purchase_order", entityId: poRows[3].id, actorId: buyer.id, action: "created", summary: "Purchase order created", createdAt: iso(-16) },
    { organizationId: org.id, entityType: "purchase_order", entityId: poRows[3].id, actorId: buyer.id, action: "status_changed", summary: "Status changed: Draft → Sent to Summit Source Co.", createdAt: iso(-16) },
    { organizationId: org.id, entityType: "purchase_order", entityId: poRows[3].id, actorId: admin.id, action: "commented", summary: "Supplier confirmed vessel booking for Mar 12.", createdAt: iso(-10) }
  ]);

  await db.insert(schema.comments).values({
    organizationId: org.id,
    entityType: "purchase_order",
    entityId: poRows[3].id,
    authorId: admin.id,
    body: "@maria supplier says the tent fabric shipment arrives Friday — tentatively OK to wait before expediting.",
    mentions: [buyer.id]
  });

  await db.insert(schema.tasks).values([
    { organizationId: org.id, title: "Confirm expedite for PO-2026-004 tents", assigneeId: buyer.id, createdById: admin.id, priority: "high", dueDate: dateOnly(2), entityType: "purchase_order", entityId: poRows[3].id },
    { organizationId: org.id, title: "Cycle count zone A at East DC", assigneeId: whManager.id, createdById: admin.id, priority: "medium", dueDate: dateOnly(7) }
  ]);

  await db.insert(schema.notifications).values([
    { organizationId: org.id, userId: admin.id, type: "alert.late_shipment", title: "Inbound ASN-2026-004 is late", body: "Expected arrival passed 2 days ago. Supplier: Summit Source Co.", entityType: "inbound_shipment" },
    { organizationId: org.id, userId: admin.id, type: "alert.low_stock", title: "Dome Tent 4P below reorder point", body: "Projected available will hit zero within ~3 weeks at current demand." }
  ]);

  console.log("Seed complete.");
  console.log("  Login: admin@demo.supplyflow.dev / admin1234");
  console.log("  Buyer: maria@demo.supplyflow.dev / buyer1234");
  console.log("  Warehouse: ken@demo.supplyflow.dev / wh12345");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
