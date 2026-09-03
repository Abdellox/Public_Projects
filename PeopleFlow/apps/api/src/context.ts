import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getValidSession,
  hasPermission,
  resolvePermissions,
  SESSION_COOKIE_NAME,
  type SessionStoreDb,
} from "@peopleflow/auth";
import { prisma, scopedClient } from "@peopleflow/database";
import type { ScopedDb } from "@peopleflow/database";

export interface RequestContext {
  userId: string;
  sessionId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  roleId: string;
  roleName: string;
  isOwner: boolean;
  permissions: Set<string>;
  employeeId: string | null;
  db: ScopedDb;
}

declare module "fastify" {
  interface FastifyRequest {
    ctx?: RequestContext;
  }
}

const sessionDb: SessionStoreDb = {
  session: prisma.session as unknown as SessionStoreDb["session"],
};

export async function authenticateRequest(request: FastifyRequest): Promise<RequestContext | null> {
  const token = request.cookies[SESSION_COOKIE_NAME];
  const secret = (request.server as unknown as { pfSecret: string }).pfSecret;
  const session = await getValidSession(sessionDb, token, secret);
  if (!session) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: session.userId },
    include: { organization: { select: { id: true, name: true, slug: true } }, role: true },
    orderBy: { createdAt: "asc" },
  });
  if (memberships.length === 0) return null;

  const requestedOrgId = request.headers["x-organization-id"] as string | undefined;
  const membership =
    (requestedOrgId ? memberships.find((m) => m.organizationId === requestedOrgId) : undefined) ??
    memberships[0];

  const employee = await prisma.employee.findFirst({
    where: { organizationId: membership.organizationId, userId: session.userId },
    select: { id: true },
  });

  const permissions = resolvePermissions(
    await loadRolePermissions(membership.roleId),
  );

  return {
    userId: session.userId,
    sessionId: session.id,
    email: session.user.email,
    name: session.user.name,
    avatarUrl: session.user.avatarUrl ?? null,
    organizationId: membership.organization.id,
    organizationName: membership.organization.name,
    organizationSlug: membership.organization.slug,
    roleId: membership.roleId,
    roleName: membership.role.name,
    isOwner: membership.isOwner,
    permissions,
    employeeId: employee?.id ?? null,
    db: scopedClient(prisma, membership.organizationId),
  };
}

async function loadRolePermissions(roleId: string): Promise<string[][]> {
  const role = await prisma.role.findUnique({ where: { id: roleId }, select: { permissions: true } });
  return [role?.permissions ?? []];
}

export function requireCtx(request: FastifyRequest): RequestContext {
  if (!request.ctx) throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  return request.ctx;
}

export function can(ctx: RequestContext, permission: string): boolean {
  return hasPermission(ctx.permissions, permission);
}
