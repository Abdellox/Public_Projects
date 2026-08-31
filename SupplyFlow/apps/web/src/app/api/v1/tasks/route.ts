import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@supplyflow/database";
import { taskCreateSchema } from "@supplyflow/validation";
import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export async function GET(): Promise<Response> {
  try {
    const ctx = await requirePermission("collaboration.write");
    void desc;
    const rows = await getDb().select({
      id: schema.tasks.id,
      title: schema.tasks.title,
      status: schema.tasks.status,
      priority: schema.tasks.priority,
      dueDate: schema.tasks.dueDate,
      assigneeId: schema.tasks.assigneeId,
      assigneeName: schema.users.name,
      entityType: schema.tasks.entityType,
      entityId: schema.tasks.entityId,
      createdAt: schema.tasks.createdAt
    }).from(schema.tasks)
      .leftJoin(schema.users, eq(schema.users.id, schema.tasks.assigneeId))
      .where(eq(schema.tasks.organizationId, ctx.user.organizationId))
      .limit(200);
    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("collaboration.write");
    const parsed = taskCreateSchema.parse(await request.json().catch(() => null));
    const [row] = await getDb().insert(schema.tasks).values({
      ...parsed,
      organizationId: ctx.user.organizationId,
      createdById: ctx.user.userId
    }).returning();
    return jsonOk({ data: row }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
