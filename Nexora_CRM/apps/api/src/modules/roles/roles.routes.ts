import { Hono } from 'hono';
import { and, asc, eq, inArray } from 'drizzle-orm';
import {
  getDb,
  organizationMemberships,
  rolePermissions,
  roles,
} from '@nexora/database';
import {
  createRoleSchema,
  setRolePermissionsSchema,
  updateRoleSchema,
} from '@nexora/validation';
import { generateToken } from '@nexora/auth';
import type { PermissionKey } from '@nexora/types';
import { ApiError, clientIp, isUniqueViolation, parseBody } from '../../lib/errors';
import { writeAudit } from '../../lib/audit';
import { requirePermission } from '../../middleware/organization';
import type { AppEnv } from '../../types';

export function buildRoleRoutes() {
  const routes = new Hono<AppEnv>();

  routes.get('/', requirePermission('roles.read'), async (c) => {
    const orgCtx = c.get('org')!;
    const db = getDb();

    const roleRows = await db
      .select()
      .from(roles)
      .where(eq(roles.organizationId, orgCtx.organizationId))
      .orderBy(asc(roles.createdAt));

    const roleIds = roleRows.map((r) => r.id);
    const permissionRows =
      roleIds.length > 0
        ? await db
            .select({ roleId: rolePermissions.roleId, key: rolePermissions.permissionKey })
            .from(rolePermissions)
            .where(inArray(rolePermissions.roleId, roleIds))
        : [];

    const byRole = new Map<string, string[]>();
    for (const row of permissionRows) {
      const list = byRole.get(row.roleId) ?? [];
      list.push(row.key);
      byRole.set(row.roleId, list);
    }

    return c.json({
      roles: roleRows.map((role) => ({
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: byRole.get(role.id) ?? [],
        createdAt: role.createdAt,
      })),
    });
  });

  routes.post('/', requirePermission('roles.create'), async (c) => {
    const orgCtx = c.get('org')!;
    const input = await parseBody(c, createRoleSchema);

    const [duplicate] = await getDb()
      .select({ id: roles.id })
      .from(roles)
      .where(
        and(
          eq(roles.organizationId, orgCtx.organizationId),
          eq(roles.name, input.name),
        ),
      )
      .limit(1);
    if (duplicate) throw ApiError.conflict('A role with this name already exists');

    try {
      const [role] = await getDb()
        .insert(roles)
        .values({
          organizationId: orgCtx.organizationId,
          key: `custom-${generateToken(6).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          name: input.name,
          description: input.description ?? null,
          isSystem: false,
        })
        .returning();
      return c.json({ role }, 201);
    } catch (err) {
      if (isUniqueViolation(err)) throw ApiError.conflict('A role with this name already exists');
      throw err;
    }
  });

  routes.patch('/:roleId', requirePermission('roles.update'), async (c) => {
    const orgCtx = c.get('org')!;
    const roleId = c.req.param('roleId');
    const input = await parseBody(c, updateRoleSchema);
    const db = getDb();

    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.organizationId, orgCtx.organizationId)))
      .limit(1);
    if (!role) throw ApiError.notFound('Role not found');
    if (role.isSystem) {
      throw ApiError.forbidden('System roles cannot be modified');
    }

    const [updated] = await db
      .update(roles)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        updatedAt: new Date(),
      })
      .where(eq(roles.id, roleId))
      .returning();

    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: c.get('session')!.id,
      action: 'role.updated',
      entityType: 'role',
      entityId: roleId,
      metadata: { ...input },
      ip: clientIp(c),
    });
    return c.json({ role: updated });
  });

  routes.put(
    '/:roleId/permissions',
    requirePermission('roles.update'),
    async (c) => {
      const orgCtx = c.get('org')!;
      const roleId = c.req.param('roleId');
      const { permissions } = await parseBody(c, setRolePermissionsSchema);
      const db = getDb();

      const [role] = await db
        .select()
        .from(roles)
        .where(and(eq(roles.id, roleId), eq(roles.organizationId, orgCtx.organizationId)))
        .limit(1);
      if (!role) throw ApiError.notFound('Role not found');
      if (role.isSystem) {
        throw ApiError.forbidden('System roles cannot be modified');
      }

      await db.transaction(async (tx) => {
        await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
        if (permissions.length > 0) {
          await tx.insert(rolePermissions).values(
            permissions.map((permissionKey) => ({
              roleId,
              permissionKey: permissionKey as PermissionKey,
            })),
          );
        }
      });

      await writeAudit(getDb(), {
        organizationId: orgCtx.organizationId,
        actorUserId: c.get('session')!.id,
        action: 'role.permissions_updated',
        entityType: 'role',
        entityId: roleId,
        metadata: { permissions },
        ip: clientIp(c),
      });
      return c.json({ ok: true });
    },
  );

  routes.delete('/:roleId', requirePermission('roles.delete'), async (c) => {
    const orgCtx = c.get('org')!;
    const roleId = c.req.param('roleId');
    const db = getDb();

    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.organizationId, orgCtx.organizationId)))
      .limit(1);
    if (!role) throw ApiError.notFound('Role not found');
    if (role.isSystem) {
      throw ApiError.forbidden('System roles cannot be deleted');
    }

    const [inUse] = await db
      .select({ id: organizationMemberships.id })
      .from(organizationMemberships)
      .where(eq(organizationMemberships.roleId, roleId))
      .limit(1);
    if (inUse) {
      throw ApiError.conflict('This role is assigned to members and cannot be deleted');
    }

    await db.delete(roles).where(eq(roles.id, roleId));
    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: c.get('session')!.id,
      action: 'role.deleted',
      entityType: 'role',
      entityId: roleId,
      ip: clientIp(c),
    });
    return c.json({ ok: true });
  });

  return routes;
}
