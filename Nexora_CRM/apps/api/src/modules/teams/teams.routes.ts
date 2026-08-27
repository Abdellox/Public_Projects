import { Hono } from 'hono';
import { and, asc, eq } from 'drizzle-orm';
import { departments, getDb, teams } from '@nexora/database';
import { createTeamSchema, updateTeamSchema } from '@nexora/validation';
import { ApiError, clientIp, isUniqueViolation, parseBody } from '../../lib/errors';
import { writeAudit } from '../../lib/audit';
import { requirePermission } from '../../middleware/organization';
import type { AppEnv } from '../../types';

export function buildTeamRoutes() {
  const routes = new Hono<AppEnv>();

  routes.get('/', requirePermission('teams.read'), async (c) => {
    const orgCtx = c.get('org')!;
    const rows = await getDb()
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        departmentId: teams.departmentId,
        departmentName: departments.name,
        createdAt: teams.createdAt,
      })
      .from(teams)
      .innerJoin(departments, eq(departments.id, teams.departmentId))
      .where(eq(teams.organizationId, orgCtx.organizationId))
      .orderBy(asc(teams.name));
    return c.json({ teams: rows });
  });

  routes.post('/', requirePermission('teams.create'), async (c) => {
    const orgCtx = c.get('org')!;
    const input = await parseBody(c, createTeamSchema);
    const db = getDb();

    const [department] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          eq(departments.id, input.departmentId),
          eq(departments.organizationId, orgCtx.organizationId),
        ),
      )
      .limit(1);
    if (!department) throw ApiError.badRequest('Unknown department for this organization');

    try {
      const [team] = await db
        .insert(teams)
        .values({
          organizationId: orgCtx.organizationId,
          departmentId: input.departmentId,
          name: input.name,
          description: input.description ?? null,
        })
        .returning();
      await writeAudit(getDb(), {
        organizationId: orgCtx.organizationId,
        actorUserId: c.get('session')!.id,
        action: 'team.created',
        entityType: 'team',
        entityId: team!.id,
        metadata: { name: input.name },
        ip: clientIp(c),
      });
      return c.json({ team }, 201);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw ApiError.conflict('A team with this name already exists in the department');
      }
      throw err;
    }
  });

  routes.patch('/:teamId', requirePermission('teams.update'), async (c) => {
    const orgCtx = c.get('org')!;
    const input = await parseBody(c, updateTeamSchema);
    const db = getDb();

    if (input.departmentId) {
      const [department] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(
          and(
            eq(departments.id, input.departmentId),
            eq(departments.organizationId, orgCtx.organizationId),
          ),
        )
        .limit(1);
      if (!department) throw ApiError.badRequest('Unknown department for this organization');
    }

    try {
      const [updated] = await db
        .update(teams)
        .set({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(teams.id, c.req.param('teamId')),
            eq(teams.organizationId, orgCtx.organizationId),
          ),
        )
        .returning();
      if (!updated) throw ApiError.notFound('Team not found');
      return c.json({ team: updated });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw ApiError.conflict('A team with this name already exists in the department');
      }
      throw err;
    }
  });

  routes.delete('/:teamId', requirePermission('teams.delete'), async (c) => {
    const orgCtx = c.get('org')!;
    const deleted = await getDb()
      .delete(teams)
      .where(
        and(
          eq(teams.id, c.req.param('teamId')),
          eq(teams.organizationId, orgCtx.organizationId),
        ),
      )
      .returning({ id: teams.id });
    if (deleted.length === 0) throw ApiError.notFound('Team not found');

    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: c.get('session')!.id,
      action: 'team.deleted',
      entityType: 'team',
      entityId: c.req.param('teamId'),
      ip: clientIp(c),
    });
    return c.json({ ok: true });
  });

  return routes;
}
