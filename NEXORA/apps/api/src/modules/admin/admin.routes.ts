import { z } from "zod";
import { and, desc, eq, like } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { Db } from "@nexora/database";
import { auditLogs, users } from "@nexora/database";
import { decodeCursor, encodeCursor, cursorBefore } from "@nexora/database";
import type { AuditLogEntry, CursorPage } from "@nexora/types";
import { auditLogQuerySchema, uuidSchema } from "@nexora/validation";
import { requireUser } from "../../lib/session-cookies.js";
import { authorize } from "../../policy/policy.js";
import type { PermissionCache } from "../../policy/policy.js";

const orgParams = z.object({ organizationId: uuidSchema });

export class AuditService {
  constructor(
    private readonly db: Db,
    private readonly permissions: PermissionCache
  ) {}

  async list(
    organizationId: string,
    userId: string,
    query: { cursor?: string; limit: number; q?: string; action?: string }
  ): Promise<CursorPage<AuditLogEntry>> {
    await authorize(this.db, this.permissions, organizationId, userId, "audit:read");

    const predicates = [eq(auditLogs.organizationId, organizationId)];
    if (query.action) predicates.push(like(auditLogs.action, `${query.action}%`));

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;
    if (cursor) {
      predicates.push(cursorBefore(auditLogs.createdAt, auditLogs.id, cursor));
    }

    const rows = await this.db
      .select({
        id: auditLogs.id,
        organizationId: auditLogs.organizationId,
        actorUserId: auditLogs.actorUserId,
        actorName: users.name,
        action: auditLogs.action,
        targetType: auditLogs.targetType,
        targetId: auditLogs.targetId,
        metadata: auditLogs.metadata,
        ip: auditLogs.ip,
        createdAt: auditLogs.createdAt
      })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.actorUserId))
      .where(and(...predicates))
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .limit(query.limit + 1);

    const page = rows.slice(0, query.limit);
    const items = page.map((r) => ({
      ...r,
      id: String(r.id),
      createdAt: r.createdAt.toISOString()
    }));

    let nextCursor: string | null = null;
    const last = items[items.length - 1];
    if (rows.length > query.limit && last) {
      nextCursor = encodeCursor({ at: last.createdAt, id: last.id });
    }
    return { items, nextCursor };
  }
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const service = new AuditService(app.db, app.permissions);

  app.get("/organizations/:organizationId/audit-logs", async (request) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    const query = auditLogQuerySchema.parse(request.query ?? {});
    return service.list(organizationId, session.userId, query);
  });
}
