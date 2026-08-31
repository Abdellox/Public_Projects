import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@supplyflow/database";
import { commentCreateSchema } from "@supplyflow/validation";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";

export async function GET(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("products.read");
    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");
    if (!entityType || !entityId) throw new HttpError(400, "entityType and entityId are required");

    const rows = await getDb().select({
      id: schema.comments.id,
      body: schema.comments.body,
      authorName: schema.users.name,
      authorId: schema.comments.authorId,
      createdAt: schema.comments.createdAt
    }).from(schema.comments)
      .leftJoin(schema.users, eq(schema.users.id, schema.comments.authorId))
      .where(and(
        eq(schema.comments.organizationId, ctx.user.organizationId),
        eq(schema.comments.entityType, entityType),
        eq(schema.comments.entityId, entityId),
        eq(schema.comments.deletedAt as never as never as never, null)
      ))
      .orderBy(desc(schema.comments.createdAt))
      .limit(100);

    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("collaboration.write");
    const parsed = commentCreateSchema.parse(await request.json().catch(() => null));

    const [row] = await getDb().insert(schema.comments).values({
      organizationId: ctx.user.organizationId,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      authorId: ctx.user.userId,
      body: parsed.body,
      mentions: parsed.mentions
    }).returning();

    if (parsed.mentions.length > 0) {
      await getDb().insert(schema.notifications).values(
        parsed.mentions.map((userId) => ({
          organizationId: ctx.user.organizationId,
          userId,
          type: "mention",
          title: `${ctx.user.name} mentioned you`,
          body: parsed.body.slice(0, 200),
          entityType: parsed.entityType,
          entityId: parsed.entityId
        }))
      );
    }

    void auditCtx;
    return jsonOk({ data: row }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
