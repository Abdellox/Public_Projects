import type { FastifyInstance } from "fastify";
import { requireCtx } from "../context.js";

export async function meRoutes(app: FastifyInstance): Promise<void> {
  app.get("/me", async (request) => {
    const ctx = requireCtx(request);
    return {
      user: { id: ctx.userId, email: ctx.email, name: ctx.name, avatarUrl: ctx.avatarUrl },
      organization: {
        id: ctx.organizationId,
        name: ctx.organizationName,
        slug: ctx.organizationSlug,
      },
      role: { id: ctx.roleId, name: ctx.roleName },
      isOwner: ctx.isOwner,
      employeeId: ctx.employeeId,
      permissions: [...ctx.permissions],
    };
  });
}
