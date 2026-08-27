import { Hono } from 'hono';
import { and, asc, eq } from 'drizzle-orm';
import {
  getDb,
  departments,
  organizationMemberships,
  roles,
  users,
} from '@nexora/database';
import { updateMemberSchema } from '@nexora/validation';
import { ApiError, clientIp, parseBody } from '../../lib/errors';
import { writeAudit } from '../../lib/audit';
import { requirePermission } from '../../middleware/organization';
import type { AppEnv } from '../../types';

async function countActiveOwners(organizationId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ userId: organizationMemberships.userId })
    .from(organizationMemberships)
    .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
    .where(
      and(
        eq(organizationMemberships.organizationId, organizationId),
        eq(organizationMemberships.status, 'active'),
        eq(roles.key, 'owner'),
      ),
    );
  return rows.length;
}

export function buildMemberRoutes() {
  const routes = new Hono<AppEnv>();

  routes.get('/', requirePermission('members.read'), async (c) => {
    const orgCtx = c.get('org')!;
    const db = getDb();
    const members = await db
      .select({
        membershipId: organizationMemberships.id,
        status: organizationMemberships.status,
        jobTitle: organizationMemberships.jobTitle,
        joinedAt: organizationMemberships.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
        role: {
          id: roles.id,
          key: roles.key,
          name: roles.name,
        },
        departmentId: organizationMemberships.departmentId,
        departmentName: departments.name,
      })
      .from(organizationMemberships)
      .innerJoin(users, eq(users.id, organizationMemberships.userId))
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .leftJoin(departments, eq(departments.id, organizationMemberships.departmentId))
      .where(eq(organizationMemberships.organizationId, orgCtx.organizationId))
      .orderBy(asc(organizationMemberships.createdAt));
    return c.json({ members });
  });

  routes.patch(
    '/:membershipId',
    requirePermission('members.update_role'),
    async (c) => {
      const orgCtx = c.get('org')!;
      const actor = c.get('session')!;
      const membershipId = c.req.param('membershipId');
      const input = await parseBody(c, updateMemberSchema);
      const db = getDb();

      const [target] = await db
        .select({
          membershipId: organizationMemberships.id,
          roleKey: roles.key,
          userId: organizationMemberships.userId,
        })
        .from(organizationMemberships)
        .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
        .where(
          and(
            eq(organizationMemberships.id, membershipId),
            eq(organizationMemberships.organizationId, orgCtx.organizationId),
          ),
        )
        .limit(1);
      if (!target) throw ApiError.notFound('Member not found');

      if (input.roleId) {
        const [newRole] = await db
          .select()
          .from(roles)
          .where(
            and(eq(roles.id, input.roleId), eq(roles.organizationId, orgCtx.organizationId)),
          )
          .limit(1);
        if (!newRole) throw ApiError.badRequest('Unknown role for this organization');

        if (newRole.key === 'owner' && orgCtx.roleKey !== 'owner') {
          throw ApiError.forbidden('Only an owner can grant the Owner role');
        }

        const demotingOwner =
          target.roleKey === 'owner' && newRole.key !== 'owner';
        if (demotingOwner && (await countActiveOwners(orgCtx.organizationId)) <= 1) {
          throw ApiError.conflict('An organization must keep at least one owner');
        }
      }

      if (input.status === 'suspended' && target.roleKey === 'owner') {
        if ((await countActiveOwners(orgCtx.organizationId)) <= 1) {
          throw ApiError.conflict('The last active owner cannot be suspended');
        }
      }

      await db
        .update(organizationMemberships)
        .set({
          ...(input.roleId ? { roleId: input.roleId } : {}),
          ...(input.status ? { status: input.status } : {}),
          updatedAt: new Date(),
        })
        .where(eq(organizationMemberships.id, membershipId));

      await writeAudit(getDb(), {
        organizationId: orgCtx.organizationId,
        actorUserId: actor.id,
        action: 'member.updated',
        entityType: 'membership',
        entityId: membershipId,
        metadata: { ...input },
        ip: clientIp(c),
      });
      return c.json({ ok: true });
    },
  );

  routes.delete('/:membershipId', requirePermission('members.remove'), async (c) => {
    const orgCtx = c.get('org')!;
    const actor = c.get('session')!;
    const membershipId = c.req.param('membershipId');
    const db = getDb();

    const [target] = await db
      .select({
        membershipId: organizationMemberships.id,
        roleKey: roles.key,
      })
      .from(organizationMemberships)
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .where(
        and(
          eq(organizationMemberships.id, membershipId),
          eq(organizationMemberships.organizationId, orgCtx.organizationId),
        ),
      )
      .limit(1);
    if (!target) throw ApiError.notFound('Member not found');

    if (target.roleKey === 'owner' && (await countActiveOwners(orgCtx.organizationId)) <= 1) {
      throw ApiError.conflict('An organization must keep at least one owner');
    }

    await db
      .delete(organizationMemberships)
      .where(eq(organizationMemberships.id, membershipId));

    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: actor.id,
      action: 'member.removed',
      entityType: 'membership',
      entityId: membershipId,
      ip: clientIp(c),
    });
    return c.json({ ok: true });
  });

  return routes;
}
