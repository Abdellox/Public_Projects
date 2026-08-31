import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@supplyflow/database";
import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

const markSchema = z.object({ id: z.string().uuid().optional(), all: z.boolean().optional() });

export async function GET(): Promise<Response> {
  try {
    const ctx = await requirePermission("products.read");
    const rows = await getDb().select({
      id: schema.notifications.id,
      type: schema.notifications.type,
      title: schema.notifications.title,
      body: schema.notifications.body,
      entityType: schema.notifications.entityType,
      entityId: schema.notifications.entityId,
      readAt: schema.notifications.readAt,
      createdAt: schema.notifications.createdAt
    }).from(schema.notifications)
      .where(and(eq(schema.notifications.organizationId, ctx.user.organizationId), eq(schema.notifications.userId, ctx.user.userId)))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(50);
    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("products.read");
    const parsed = markSchema.parse(await request.json().catch(() => ({})));
    const db = getDb();
    const conditions = [eq(schema.notifications.organizationId, ctx.user.organizationId), eq(schema.notifications.userId, ctx.user.userId), isNull(schema.notifications.readAt)];
    if (!parsed.all && parsed.id) conditions.push(eq(schema.notifications.id, parsed.id));
    await db.update(schema.notifications).set({ readAt: new Date() }).where(and(...conditions));
    return jsonOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
