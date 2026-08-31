import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema, logAudit } from "@supplyflow/database";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

const commitSchema = z.object({
  entity: z.enum(["products", "suppliers", "customers"]),
  mode: z.enum(["upsert", "create_only"]).default("upsert"),
  mappings: z.record(z.string(), z.string()),
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(2000)
});

interface RowResult {
  row: number;
  status: "created" | "updated" | "skipped" | "error";
  message?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("products.write");
    const parsed = commitSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    const results: RowResult[] = [];
    let created = 0;
    let updated = 0;
    let errors = 0;

    await db.transaction(async (tx) => {
      for (let i = 0; i < parsed.rows.length; i++) {
        const raw = mapRow(parsed.rows[i], parsed.mappings);
        try {
          if (parsed.entity === "products") {
            if (!raw.sku || !raw.name) throw new Error("sku and name are required");
            const values = {
              sku: String(raw.sku).trim(),
              name: String(raw.name).trim(),
              description: strOrNull(raw.description),
              unit: (raw.unit as string) || "unit",
              barcode: strOrNull(raw.barcode),
              costPrice: moneyOrNull(raw.cost_price ?? raw.cost),
              sellingPrice: moneyOrNull(raw.selling_price ?? raw.price),
              minStock: Number(raw.min_stock ?? 0) || 0,
              maxStock: numOrNull(raw.max_stock),
              reorderPoint: numOrNull(raw.reorder_point),
              reorderQuantity: numOrNull(raw.reorder_quantity),
              leadTimeDays: intOrNull(raw.lead_time_days),
              tags: [] as string[]
            };
            const existing = (await tx.select({ id: schema.products.id }).from(schema.products)
              .where(and(eq(schema.products.organizationId, ctx.user.organizationId), eq(schema.products.sku, values.sku))).limit(1))[0];

            if (existing) {
              if (parsed.mode === "create_only") {
                results.push({ row: i + 1, status: "skipped", message: `SKU ${values.sku} already exists` });
                continue;
              }
              await tx.update(schema.products).set(values).where(eq(schema.products.id, existing.id));
              updated++;
              results.push({ row: i + 1, status: "updated", message: values.sku });
            } else {
              await tx.insert(schema.products).values({ ...values, organizationId: ctx.user.organizationId });
              created++;
              results.push({ row: i + 1, status: "created", message: values.sku });
            }
          }

          if (parsed.entity === "suppliers") {
            if (!raw.name) throw new Error("name is required");
            const values = {
              code: strOrNull(raw.code),
              name: String(raw.name).trim(),
              email: strOrNull(raw.email),
              phone: strOrNull(raw.phone),
              city: strOrNull(raw.city),
              country: strOrNull(raw.country),
              paymentTerms: (raw.payment_terms as string) || "NET30",
              defaultLeadTimeDays: intOrNull(raw.lead_time_days) ?? 14
            };
            const key = values.code ?? values.name.toLowerCase();
            const all = await tx.select({ id: schema.suppliers.id, code: schema.suppliers.code, name: schema.suppliers.name })
              .from(schema.suppliers).where(eq(schema.suppliers.organizationId, ctx.user.organizationId));
            const match = all.find((s) => (s.code && s.code === key) || s.name.toLowerCase() === key);

            if (match) {
              if (parsed.mode === "create_only") {
                results.push({ row: i + 1, status: "skipped", message: `${values.name} already exists` });
                continue;
              }
              await tx.update(schema.suppliers).set(values).where(eq(schema.suppliers.id, match.id));
              updated++;
              results.push({ row: i + 1, status: "updated", message: values.name });
            } else {
              await tx.insert(schema.suppliers).values({ ...values, organizationId: ctx.user.organizationId });
              created++;
              results.push({ row: i + 1, status: "created", message: values.name });
            }
          }

          if (parsed.entity === "customers") {
            if (!raw.name) throw new Error("name is required");
            const values = {
              code: strOrNull(raw.code),
              name: String(raw.name).trim(),
              email: strOrNull(raw.email),
              phone: strOrNull(raw.phone),
              city: strOrNull(raw.city),
              country: strOrNull(raw.country),
              paymentTerms: (raw.payment_terms as string) || "NET30"
            };
            const key = values.code ?? values.name.toLowerCase();
            const all = await tx.select({ id: schema.customers.id, code: schema.customers.code, name: schema.customers.name })
              .from(schema.customers).where(eq(schema.customers.organizationId, ctx.user.organizationId));
            const match = all.find((c) => (c.code && c.code === key) || c.name.toLowerCase() === key);

            if (match) {
              if (parsed.mode === "create_only") {
                results.push({ row: i + 1, status: "skipped", message: `${values.name} already exists` });
                continue;
              }
              await tx.update(schema.customers).set(values).where(eq(schema.customers.id, match.id));
              updated++;
              results.push({ row: i + 1, status: "updated", message: values.name });
            } else {
              await tx.insert(schema.customers).values({ ...values, organizationId: ctx.user.organizationId });
              created++;
              results.push({ row: i + 1, status: "created", message: values.name });
            }
          }
        } catch (rowErr) {
          errors++;
          results.push({ row: i + 1, status: "error", message: rowErr instanceof Error ? rowErr.message : "Unknown error" });
        }
      }
    });

    await logAudit(auditCtx(ctx), "data.imported", parsed.entity, undefined, {
      entity: parsed.entity,
      created,
      updated,
      errors,
      total: parsed.rows.length
    });

    return jsonOk({ data: { created, updated, skipped: results.filter((r) => r.status === "skipped").length, errors, results } });
  } catch (err) {
    return errorResponse(err);
  }
}

function mapRow(raw: Record<string, unknown>, mappings: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [sourceCol, targetField] of Object.entries(mappings)) {
    if (!targetField) continue;
    out[targetField] = raw[sourceCol];
  }
  return out;
}

function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^0-9.eE+-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function intOrNull(v: unknown): number | null {
  const n = numOrNull(v);
  return n === null ? null : Math.round(n);
}

function moneyOrNull(v: unknown): string | null {
  const n = numOrNull(v);
  return n === null ? null : n.toFixed(2);
}
