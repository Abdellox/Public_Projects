import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import {
  createSession,
  revokeAllSessions,
  verifyPassword,
  type SessionStoreDb,
} from "@peopleflow/auth";
import { prisma } from "@peopleflow/database";
import { loginSchema, signupSchema, changePasswordSchema } from "@peopleflow/validation";
import { badRequest, conflict, unauthorized } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { clearSessionCookie, clientIp, setSessionCookie } from "../lib/cookies.js";
import { provisionOrganization, slugify } from "../services/org-setup.js";
import { audit } from "../services/audit.js";

const prismaSessionStore = prisma as unknown as SessionStoreDb;

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/auth/signup",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const input = signupSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (existingUser) {
        throw conflict("An account with this email already exists");
      }

      let slug = slugify(input.organizationName);
      if (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await prisma.user.create({
        data: { email: input.email, passwordHash, name: input.name },
      });

      const organization = await prisma.organization.create({
        data: {
          name: input.organizationName,
          slug,
        },
      });
      await provisionOrganization(organization.id);

      const ownerRole = await prisma.role.findFirstOrThrow({
        where: { organizationId: organization.id, systemKey: "owner" },
      });
      const activeStatus = await prisma.employeeStatusDef.findFirstOrThrow({
        where: { organizationId: organization.id, isDefault: true },
      });
      const employee = await prisma.employee.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          employeeNumber: "EMP-001",
          firstName: input.name.split(/\s+/)[0],
          lastName: input.name.split(/\s+/).slice(1).join(" ") || "-",
          email: input.email,
          employmentType: "FULL_TIME",
          startDate: new Date(),
          statusId: activeStatus.id,
        },
      });
      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          roleId: ownerRole.id,
          isOwner: true,
        },
      });

      await audit({
        organizationId: organization.id,
        actorId: user.id,
        actorName: user.name,
        action: "organization.created",
        entityType: "Organization",
        entityId: organization.id,
        ip: clientIp(request),
      });

      const token = await createSession(prismaSessionStore, {
        userId: user.id,
        secret: app.pfSecret,
        ip: clientIp(request),
        userAgent: request.headers["user-agent"],
      });
      setSessionCookie(reply, app.pfEnv, token);
      return reply.code(201).send({
        user: { id: user.id, email: user.email, name: user.name },
        organization: { id: organization.id, name: organization.name, slug: organization.slug },
      });
    },
  );

  app.post(
    "/auth/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const input = loginSchema.parse(request.body);
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      const ok = user ? await verifyPassword(input.password, user.passwordHash) : false;
      if (!user || !ok) {
        throw unauthorized("Invalid email or password");
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      const token = await createSession(prismaSessionStore, {
        userId: user.id,
        secret: app.pfSecret,
        ip: clientIp(request),
        userAgent: request.headers["user-agent"],
      });
      setSessionCookie(reply, app.pfEnv, token);
      await audit({ actorId: user.id, actorName: user.name, action: "auth.login", ip: clientIp(request) });
      return { user: { id: user.id, email: user.email, name: user.name } };
    },
  );

  app.post("/auth/logout", async (request, reply) => {
    const ctx = request.ctx;
    if (ctx) {
      await prisma.session.deleteMany({ where: { userId: ctx.userId } });
    }
    clearSessionCookie(reply, app.pfEnv);
    return { ok: true };
  });

  app.post("/auth/change-password", async (request, reply) => {
    const ctx = requireCtx(request);
    const input = changePasswordSchema.parse(request.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: ctx.userId } });
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw badRequest("Current password is incorrect");
    }
    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    ]);
    await revokeAllSessions(prisma as never, user.id);
    clearSessionCookie(reply, app.pfEnv);
    await audit({
      organizationId: ctx.organizationId,
      actorId: user.id,
      actorName: user.name,
      action: "auth.password_changed",
    });
    return { ok: true };
  });
}
