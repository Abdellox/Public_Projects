import type { FastifyInstance } from "fastify";
import { prisma } from "@peopleflow/database";
import { requirePermission } from "../lib/errors.js";
import { meta, pageQuery, skipTake } from "../lib/pagination.js";
import { requireCtx } from "../context.js";

export async function auditRoutes(app: FastifyInstance): Promise<void> {
  app.get("/audit", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "audit.view");
    const query = pageQuery.parse(request.query);
    const filters = request.query as {
      actorId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
    };

    const where: Record<string, unknown> = {
      organizationId: ctx.organizationId,
      ...(filters.actorId ? { actorId: filters.actorId } : {}),
      ...(filters.action ? { action: { contains: filters.action } } : {}),
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.entityId ? { entityId: filters.entityId } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...skipTake(query),
      }),
    ]);
    return { data: rows, meta: meta(total, query) };
  });
}
