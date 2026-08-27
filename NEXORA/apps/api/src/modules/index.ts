import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth/auth.routes.js";
import { organizationRoutes } from "./organizations/organizations.routes.js";
import { structureRoutes } from "./structure/structure.routes.js";
import { memberRoutes } from "./members/members.routes.js";
import { meRoutes } from "./me/me.routes.js";
import { adminRoutes } from "./admin/admin.routes.js";

/** Registers the versioned API surface. */
export async function apiRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(organizationRoutes, { prefix: "/organizations" });
  await app.register(structureRoutes);
  await app.register(memberRoutes);
  await app.register(meRoutes, { prefix: "/me" });
  await app.register(adminRoutes);
}
