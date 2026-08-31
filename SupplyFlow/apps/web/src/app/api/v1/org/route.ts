import { desc, eq } from "drizzle-orm";
import { getDb, logAudit, schema, slugifyUnique } from "@supplyflow/database";
import { createOrgSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("products.read");
    const url = new URL(request.url);

    if (url.searchParams.get("view") === "audit") {
      await requirePermission("audit.read");
      const rows = await getDb().select({
        id: schema.auditLogs.id,
        action: schema.auditLogs.action,
        entityType: schema.auditLogs.entityType,
        entityId: schema.auditLogs.entityId,
        metadata: schema.auditLogs.metadata,
        userName: schema.users.name,
        createdAt: schema.auditLogs.createdAt
      }).from(schema.auditLogs)
        .leftJoin(schema.users, eq(schema.users.id, schema.auditLogs.userId))
        .where(eq(schema.auditLogs.organizationId, ctx.user.organizationId))
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(Number(url.searchParams.get("limit") ?? 200));
      return jsonOk({ data: rows });
    }

    const org = (await getDb().select().from(schema.organizations).where(eq(schema.organizations.id, ctx.user.organizationId)).limit(1))[0];
    return jsonOk({ data: org });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("org.manage");
    const parsed = createOrgSchema.partial().parse(await request.json().catch(() => null));
    const [row] = await getDb().update(schema.organizations).set(parsed).where(eq(schema.organizations.id, ctx.user.organizationId)).returning();
    await logAudit(auditCtx(ctx), "organization.updated");
    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("products.read");
    const parsed = createOrgSchema.parse(await request.json().catch(() => null));
    const db = getDb();
    const slug = await slugifyUnique(db, parsed.name);
    const [org] = await db.insert(schema.organizations).values({
      name: parsed.name,
      slug,
      currency: parsed.currency,
      timezone: parsed.timezone
    }).returning();
    await db.insert(schema.memberships).values({
      organizationId: org.id,
      userId: ctx.user.userId,
      role: "owner"
    });
    return jsonOk({ data: { id: org.id, slug: org.slug } }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
