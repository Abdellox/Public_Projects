import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import {
  createRoleSchema,
  inviteMemberSchema,
  updateMemberSchema,
  updateOrganizationSchema,
  updateRoleSchema,
} from "@peopleflow/validation";
import { ALL_PERMISSIONS } from "@peopleflow/auth";
import { prisma } from "@peopleflow/database";
import { badRequest, conflict, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { audit } from "../services/audit.js";
import { clientIp } from "../lib/cookies.js";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // ── Organization ───────────────────────────────────────────────────────────
  app.patch("/organization", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = updateOrganizationSchema.parse(request.body);
    const row = await prisma.organization.update({
      where: { id: ctx.organizationId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl ?? null } : {}),
      },
    });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "organization.updated",
      ip: clientIp(request),
    });
    return { id: row.id, name: row.name, logoUrl: row.logoUrl };
  });

  // ── Roles ──────────────────────────────────────────────────────────────────
  app.get("/roles", async (request) => {
    const ctx = requireCtx(request);
    const rows = await ctx.db.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { memberships: true } } },
    });
    return {
      data: rows.map((r) => ({
        ...r,
        permissionCount: r.permissions.includes("*") ? ALL_PERMISSIONS.length : r.permissions.length,
      })),
      catalog: ALL_PERMISSIONS,
    };
  });

  app.post("/roles", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "role.manage");
    const input = createRoleSchema.parse(request.body);
    validatePermissionKeys(input.permissions);
    const duplicate = await ctx.db.role.findFirst({ where: { name: input.name }, select: { id: true } });
    if (duplicate) throw conflict("A role with this name already exists");
    const role = await ctx.db.role.create({
      data: { organizationId: ctx.organizationId, name: input.name, permissions: input.permissions },
    });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "role.created",
      entityType: "Role",
      entityId: role.id,
      metadata: { name: input.name, permissions: input.permissions.length },
      ip: clientIp(request),
    });
    return reply.code(201).send(role);
  });

  app.patch("/roles/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "role.manage");
    const { id } = request.params as { id: string };
    const input = updateRoleSchema.parse(request.body);
    if (input.permissions) validatePermissionKeys(input.permissions);
    const existing = await ctx.db.role.findFirst({ where: { id }, select: { id: true, isSystem: true, systemKey: true } });
    if (!existing) throw notFound();
    if (existing.systemKey === "owner") throw badRequest("The owner role cannot be modified");

    const role = await ctx.db.role.update({
      where: { id: existing.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.permissions !== undefined ? { permissions: input.permissions } : {}),
      },
    });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "role.updated",
      entityType: "Role",
      entityId: role.id,
      metadata: { permissions: role.permissions.length },
      ip: clientIp(request),
    });
    return role;
  });

  // ── Members ────────────────────────────────────────────────────────────────
  app.get("/members", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "member.manage");
    const rows = await ctx.db.membership.findMany({
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true, lastLoginAt: true } },
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return { data: rows };
  });

  app.post("/members/invite", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "member.manage");
    const input = inviteMemberSchema.parse(request.body);

    const role = await ctx.db.role.findFirst({ where: { id: input.roleId }, select: { id: true, name: true } });
    if (!role) throw badRequest("Role not found in this organization");

    let user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      const temporaryPassword = `Pf-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
      user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash: await bcrypt.hash(temporaryPassword, 12),
        },
      });
      app.log.info({ email: input.email }, "Provisional password generated for invited user");
    }

    const existingMembership = await ctx.db.membership.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existingMembership) throw conflict("This person is already a member of the organization");

    await ctx.db.membership.create({
      data: { userId: user.id, organizationId: ctx.organizationId, roleId: role.id },
    });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "member.invited",
      entityType: "User",
      entityId: user.id,
      metadata: { email: input.email, role: role.name },
      ip: clientIp(request),
    });
    return reply.code(201).send({ userId: user.id, email: user.email, role: role.name });
  });

  app.patch("/members/:userId", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "member.manage");
    const { userId } = request.params as { userId: string };
    const input = updateMemberSchema.parse(request.body);

    const membership = await ctx.db.membership.findFirst({ where: { userId }, select: { id: true, isOwner: true } });
    if (!membership) throw notFound("Member not found");
    if (membership.isOwner && ctx.userId !== userId) {
      throw badRequest("Owner membership can only be changed by the owner");
    }

    if (input.roleId) {
      const role = await ctx.db.role.findFirst({ where: { id: input.roleId }, select: { systemKey: true } });
      if (!role) throw badRequest("Role not found");
    }
    await ctx.db.membership.update({
      where: { id: membership.id },
      data: { ...(input.roleId ? { roleId: input.roleId } : {}) },
    });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "member.role_changed",
      entityType: "Membership",
      entityId: membership.id,
      metadata: { targetUserId: userId, roleId: input.roleId ?? null },
      ip: clientIp(request),
    });
    return { ok: true };
  });

  app.delete("/members/:userId", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "member.manage");
    const { userId } = request.params as { userId: string };

    const owners = await ctx.db.membership.count({ where: { isOwner: true } });
    const membership = await ctx.db.membership.findFirst({
      where: { userId },
      select: { id: true, isOwner: true },
    });
    if (!membership) throw notFound("Member not found");
    if (membership.isOwner && owners <= 1) {
      throw badRequest("Cannot remove the last owner of an organization");
    }
    await ctx.db.membership.deleteMany({ where: { userId } });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "member.removed",
      entityType: "User",
      entityId: userId,
      ip: clientIp(request),
    });
    return { ok: true };
  });
}

function validatePermissionKeys(permissions: string[]): void {
  for (const p of permissions) {
    if (p === "*") continue;
    if (!(ALL_PERMISSIONS as readonly string[]).includes(p)) {
      throw badRequest(`Unknown permission: ${p}`);
    }
  }
}
