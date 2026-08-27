import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { uuidSchema, createOrganizationSchema, updateOrganizationSchema } from "@nexora/validation";
import { audit } from "../../lib/audit.js";
import { requireUser } from "../../lib/session-cookies.js";
import { OrganizationService } from "./organizations.service.js";

export async function organizationRoutes(app: FastifyInstance): Promise<void> {
  const service = new OrganizationService(app.db, app.permissions);

  app.post("/", { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } }, async (request, reply) => {
    const session = await requireUser(request);
    const dto = createOrganizationSchema.parse(request.body);
    const org = await service.create(session.userId, dto);
    await audit(app.db, {
      actorUserId: session.userId,
      action: "organization.created",
      targetType: "organization",
      targetId: org.id,
      metadata: { name: org.name, slug: org.slug },
      request
    });
    reply.code(201).send(org);
  });

  app.get("/mine", async (request) => {
    const session = await requireUser(request);
    return service.listForUser(session.userId);
  });

  app.get("/slug/:slug", async (request) => {
    const session = await requireUser(request);
    const { slug } = z.object({ slug: z.string().min(1).max(64) }).parse(request.params);
    return service.overviewBySlug(slug, session.userId);
  });

  app.patch("/:organizationId", async (request) => {
    const session = await requireUser(request);
    const { organizationId } = z.object({ organizationId: uuidSchema }).parse(request.params);
    const dto = updateOrganizationSchema.parse(request.body);
    await service.update(organizationId, session.userId, dto);
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "organization.updated",
      targetType: "organization",
      targetId: organizationId,
      request
    });
    return { ok: true };
  });
}
