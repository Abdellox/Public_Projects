import { and, eq, isNull, sql } from "drizzle-orm";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { getDb, logAudit, num, schema } from "@supplyflow/database";
import { auditCtx, errorResponse, requirePermission } from "@/lib/server/api";

const ENTITIES = ["products", "suppliers", "customers", "inventory", "purchase_orders", "customer_orders"] as const;
type Entity = (typeof ENTITIES)[number];

export async function GET(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("reports.read");
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity") as Entity | null;
    const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
    if (!entity || !ENTITIES.includes(entity)) {
      return Response.json({ error: `entity must be one of: ${ENTITIES.join(", ")}` }, { status: 400 });
    }

    const { headers, rows } = await exportData(ctx.user.organizationId, entity);
    await logAudit(auditCtx(ctx), "data.exported", entity, undefined, { format, rows: rows.length });

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `${entity}-${stamp}.${format}`;

    if (format === "csv") {
      const csv = Papa.unparse({ fields: headers, data: rows });
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(entity.slice(0, 28));
    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true };
    for (const row of rows) sheet.addRow(row.map((v) => (typeof v === "string" && v !== "" && !isNaN(Number(v)) ? Number(v) : v)));
    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err) {
    return errorResponse(err);
  }
}

async function exportData(organizationId: string, entity: Entity): Promise<{ headers: string[]; rows: unknown[][] }> {
  const db = getDb();

  if (entity === "products") {
    const rows = await db.select({
      sku: schema.products.sku,
      name: schema.products.name,
      unit: schema.products.unit,
      cost_price: schema.products.costPrice,
      selling_price: schema.products.sellingPrice,
      min_stock: schema.products.minStock,
      reorder_point: schema.products.reorderPoint,
      lead_time_days: schema.products.leadTimeDays
    }).from(schema.products)
      .where(and(eq(schema.products.organizationId, organizationId), isNull(schema.products.deletedAt)))
      .orderBy(schema.products.sku).limit(10000);
    return { headers: ["sku", "name", "unit", "cost_price", "selling_price", "min_stock", "reorder_point", "lead_time_days"], rows: rows.map((r) => Object.values(r)) };
  }

  if (entity === "suppliers") {
    const rows = await db.select({
      code: schema.suppliers.code,
      name: schema.suppliers.name,
      email: schema.suppliers.email,
      phone: schema.suppliers.phone,
      city: schema.suppliers.city,
      country: schema.suppliers.country,
      payment_terms: schema.suppliers.paymentTerms,
      lead_time_days: schema.suppliers.defaultLeadTimeDays
    }).from(schema.suppliers)
      .where(and(eq(schema.suppliers.organizationId, organizationId), isNull(schema.suppliers.deletedAt)))
      .orderBy(schema.suppliers.name).limit(10000);
    return { headers: ["code", "name", "email", "phone", "city", "country", "payment_terms", "lead_time_days"], rows: rows.map((r) => Object.values(r)) };
  }

  if (entity === "customers") {
    const rows = await db.select({
      code: schema.customers.code,
      name: schema.customers.name,
      email: schema.customers.email,
      phone: schema.customers.phone,
      city: schema.customers.city,
      country: schema.customers.country
    }).from(schema.customers)
      .where(and(eq(schema.customers.organizationId, organizationId), isNull(schema.customers.deletedAt)))
      .orderBy(schema.customers.name).limit(10000);
    return { headers: ["code", "name", "email", "phone", "city", "country"], rows: rows.map((r) => Object.values(r)) };
  }

  if (entity === "purchase_orders") {
    const rows = await db.select({
      number: schema.purchaseOrders.number,
      supplier: schema.suppliers.name,
      status: schema.purchaseOrders.status,
      order_date: schema.purchaseOrders.orderDate,
      expected_date: schema.purchaseOrders.expectedDate,
      total: schema.purchaseOrders.total,
      currency: schema.purchaseOrders.currency
    }).from(schema.purchaseOrders)
      .innerJoin(schema.suppliers, eq(schema.suppliers.id, schema.purchaseOrders.supplierId))
      .where(and(eq(schema.purchaseOrders.organizationId, organizationId), isNull(schema.purchaseOrders.deletedAt)))
      .limit(10000);
    return { headers: ["number", "supplier", "status", "order_date", "expected_date", "total", "currency"], rows: rows.map((r) => Object.values(r)) };
  }

  if (entity === "customer_orders") {
    const rows = await db.select({
      number: schema.customerOrders.number,
      customer: schema.customers.name,
      status: schema.customerOrders.status,
      priority: schema.customerOrders.priority,
      order_date: schema.customerOrders.orderDate,
      required_date: schema.customerOrders.requiredDate,
      total: schema.customerOrders.total
    }).from(schema.customerOrders)
      .innerJoin(schema.customers, eq(schema.customers.id, schema.customerOrders.customerId))
      .where(and(eq(schema.customerOrders.organizationId, organizationId), isNull(schema.customerOrders.deletedAt)))
      .limit(10000);
    return { headers: ["number", "customer", "status", "priority", "order_date", "required_date", "total"], rows: rows.map((r) => Object.values(r)) };
  }

  // inventory
  const result = await db.execute(sql`
    select p.sku, p.name, w.code as warehouse, i.quantity_on_hand, i.reserved_quantity,
           i.quantity_on_hand - i.reserved_quantity as available,
           coalesce(p.cost_price::float8 * i.quantity_on_hand, 0) as value
    from inventory i
    join products p on p.id = i.product_id
    join warehouses w on w.id = i.warehouse_id
    where i.organization_id = ${organizationId}
    order by p.sku, w.code
  `);
  const raw = ((result as unknown as { rows?: Record<string, unknown>[] }).rows ?? []) as Record<string, unknown>[];
  const headers = ["sku", "name", "warehouse", "on_hand", "reserved", "available", "value"];
  return { headers, rows: raw.map((r) => [r.sku, r.name, r.warehouse, num(String(r.on_hand)), num(String(r.reserved)), num(String(r.available)), num(String(r.value))]) };
}

