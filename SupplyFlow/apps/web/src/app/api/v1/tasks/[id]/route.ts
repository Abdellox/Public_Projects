import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@supplyflow/database";
import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

const patchSchema = z.object({ id: z.string().uuid(), status: z.enum(["open", "in_progress", "done", "cancelled"]) });

export async function PATCH(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("collaboration.write");
    const parsed = patchSchema.parse(await request.json().catch(() => null));
    const db = getDb();
    const [row] = await db.update(schema.tasks).set({
      status: parsed.status,
      completedAt: ["done", "cancelled"].includes(parsed.status) ? new Date() : null,
      updatedAt: new Date()
    }).where(and(eq(schema.tasks.organizationId, ctx.user.organizationId), eq(schema.tasks.id, parsed.id))).returning();
    if (!row) return Response.json({ error: "Task not found" }, { status: 404 });
    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
}
