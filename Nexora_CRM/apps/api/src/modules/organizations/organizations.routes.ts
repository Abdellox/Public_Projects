import { Hono } from 'hono';
import { and, eq, isNull } from 'drizzle-orm';
import {
  getDb,
  organizations,
  organizationMemberships,
  roles,
} from '@nexora/database';
import { createOrganizationSchema, updateOrganizationSchema } from '@nexora/validation';
import { ApiError, clientIp, parseBody } from '../../lib/errors';
import { writeAudit } from '../../lib/audit';
import { requireSession } from '../../middleware/session';
import { requirePermission } from '../../middleware/organization';
import type { AppEnv } from '../../types';
import {
  createOrganization,
  deleteOrganization,
  getOrganizationDetail,
  updateOrganization,
} from './organizations.service';

export const organizationRootRoutes = new Hono<AppEnv>();

organizationRootRoutes.use('*', requireSession());

organizationRootRoutes.post('/', async (c) => {
  const session = c.get('session')!;
  const input = await parseBody(c, createOrganizationSchema);
  const org = await createOrganization(session.id, input);
  await writeAudit(getDb(), {
    organizationId: org.id,
    actorUserId: session.id,
    action: 'org.created',
    entityType: 'organization',
    entityId: org.id,
    metadata: { name: org.name, slug: org.slug },
    ip: clientIp(c),
  });
  return c.json({ organization: org }, 201);
});

organizationRootRoutes.get('/', async (c) => {
  const session = c.get('session')!;
  const db = getDb();
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      roleKey: roles.key,
      roleName: roles.name,
      status: organizationMemberships.status,
    })
    .from(organizations)
    .innerJoin(
      organizationMemberships,
      and(
        eq(organizationMemberships.organizationId, organizations.id),
        eq(organizationMemberships.userId, session.id),
      ),
    )
    .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
    .where(isNull(organizations.deletedAt));
  return c.json({ organizations: rows });
});

export function buildOrganizationRoutes() {
  const org = new Hono<AppEnv>();

  org.get('/', async (c) => {
    const detail = await getOrganizationDetail(c.get('org')!.organizationId);
    return c.json({ organization: detail });
  });

  org.patch('/', requirePermission('organization.update'), async (c) => {
    const input = await parseBody(c, updateOrganizationSchema);
    const detail = await updateOrganization(c.get('org')!.organizationId, input);
    await writeAudit(getDb(), {
      organizationId: c.get('org')!.organizationId,
      actorUserId: c.get('session')!.id,
      action: 'org.updated',
      entityType: 'organization',
      entityId: detail.id,
      metadata: { ...input },
      ip: clientIp(c),
    });
    return c.json({ organization: detail });
  });

  org.delete('/', requirePermission('organization.delete'), async (c) => {
    const orgCtx = c.get('org')!;
    if (orgCtx.roleKey !== 'owner') {
      throw ApiError.forbidden('Only the owner can delete the organization');
    }
    await deleteOrganization(orgCtx.organizationId);
    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: c.get('session')!.id,
      action: 'org.deleted',
      entityType: 'organization',
      entityId: orgCtx.organizationId,
      ip: clientIp(c),
    });
    return c.json({ ok: true });
  });

  return org;
}
