import { z } from "zod";
import type { FastifyInstance } from "fastify";
import {
  uuidSchema,
  paginationQuerySchema,
  listMembersQuerySchema,
  updateMemberSchema,
  createInvitationSchema,
  acceptInvitationSchema
} from "@nexora/validation";
import { INVITATION_TTL_MS } from "../../constants.js";
import { audit } from "../../lib/audit.js";
import { requireUser } from "../../lib/session-cookies.js";
import { MembersService } from "./members.service.js";
import { InvitationsService } from "./invitations.service.js";

const orgParams = z.object({ organizationId: uuidSchema });
const membershipParams = z.object({ organizationId: uuidSchema, membershipId: uuidSchema });
const invitationParams = z.object({ organizationId: uuidSchema, invitationId: uuidSchema });

export async function memberRoutes(app: FastifyInstance): Promise<void> {
  const members = new MembersService(app.db, app.permissions);
  const invitationsService = new InvitationsService(app.db, app.permissions);

  app.get("/organizations/:organizationId/members", async (request) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    const query = listMembersQuerySchema.parse(request.query ?? {});
    return members.list(organizationId, session.userId, query);
  });

  app.patch("/organizations/:organizationId/members/:membershipId", async (request) => {
    const session = await requireUser(request);
    const { organizationId, membershipId } = membershipParams.parse(request.params);
    const dto = updateMemberSchema.parse(request.body);
    const result = await members.updateMember(organizationId, session.userId, membershipId, dto);
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "member.updated",
      targetType: "membership",
      targetId: membershipId,
      metadata: { changes: Object.keys(dto) },
      request
    });
    return result;
  });

  app.delete("/organizations/:organizationId/members/:membershipId", async (request) => {
    const session = await requireUser(request);
    const { organizationId, membershipId } = membershipParams.parse(request.params);
    const result = await members.removeMember(organizationId, session.userId, membershipId);
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "member.removed",
      targetType: "membership",
      targetId: membershipId,
      request
    });
    return result;
  });

  /* ------------------------------- invitations ------------------------------ */

  app.post("/organizations/:organizationId/invitations", async (request, reply) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    const dto = createInvitationSchema.parse(request.body);
    const created = await invitationsService.create(organizationId, session.userId, dto, {
      tokenTtlMs: INVITATION_TTL_MS
    });
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "invitation.created",
      targetType: "invitation",
      targetId: created.id,
      metadata: { email: created.email },
      request
    });
    // v1 returns the raw token in the response because no email delivery is
    // wired yet; documented as a known bootstrap limitation in /docs.
    reply.code(201).send(created);
  });

  app.get("/organizations/:organizationId/invitations", async (request) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    void paginationQuerySchema; // reserved for future paging of this list
    return invitationsService.list(organizationId, session.userId);
  });

  app.delete("/organizations/:organizationId/invitations/:invitationId", async (request) => {
    const session = await requireUser(request);
    const { organizationId, invitationId } = invitationParams.parse(request.params);
    const result = await invitationsService.revoke(organizationId, session.userId, invitationId);
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "invitation.revoked",
      targetType: "invitation",
      targetId: invitationId,
      request
    });
    return result;
  });

  app.post("/invitations/accept", async (request) => {
    const session = await requireUser(request);
    const dto = acceptInvitationSchema.parse(request.body);
    const result = await invitationsService.accept(session.userId, session.user.email, dto.token);
    await audit(app.db, {
      organizationId: result.organizationId,
      actorUserId: session.userId,
      action: "invitation.accepted",
      targetType: "user",
      targetId: session.userId,
      request
    });
    return result;
  });
}
