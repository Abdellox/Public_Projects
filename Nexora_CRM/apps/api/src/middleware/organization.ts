import { createMiddleware } from 'hono/factory';
import { and, eq, isNull } from 'drizzle-orm';
import {
  getDb,
  organizations,
  organizationMemberships,
  rolePermissions,
  roles,
} from '@nexora/database';
import { ApiError } from '../lib/errors';
import type { AppEnv, OrganizationContext } from '../types';

/**
 * Tenant boundary. A missing membership and a missing organization are
 * indistinguishable (404) so other tenants' identifiers can't be probed.
 */
export const requireOrganization = createMiddleware<AppEnv>(async (c, next) => {
  const session = c.get('session');
  if (!session) throw ApiError.unauthorized();

  const orgId = c.req.param('orgId');
  if (!orgId) throw ApiError.badRequest('Missing organization id');

  const db = getDb();
  const [row] = await db
    .select({
      membershipId: organizationMemberships.id,
      roleId: roles.id,
      roleKey: roles.key,
      organizationId: organizations.id,
      organizationSlug: organizations.slug,
    })
    .from(organizations)
    .innerJoin(
      organizationMemberships,
      and(
        eq(organizationMemberships.organizationId, organizations.id),
        eq(organizationMemberships.userId, session.id),
        eq(organizationMemberships.status, 'active'),
      ),
    )
    .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
    .where(and(eq(organizations.id, orgId), isNull(organizations.deletedAt)))
    .limit(1);

  if (!row) throw ApiError.notFound('Organization not found');

  const permissionRows = await db
    .select({ permissionKey: rolePermissions.permissionKey })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, row.roleId));

  const ctx: OrganizationContext = {
    organizationId: row.organizationId,
    organizationSlug: row.organizationSlug,
    membershipId: row.membershipId,
    roleId: row.roleId,
    roleKey: row.roleKey,
    permissions: new Set(permissionRows.map((p) => p.permissionKey)),
  };
  c.set('org', ctx);
  await next();
});

export function requirePermission(key: string) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const org = c.get('org');
    if (!org) throw ApiError.forbidden();
    if (!org.permissions.has(key)) {
      throw ApiError.forbidden(`Missing required permission: ${key}`);
    }
    await next();
  });
}
