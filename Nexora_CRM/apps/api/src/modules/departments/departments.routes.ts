import { Hono } from 'hono';
import { and, asc, eq } from 'drizzle-orm';
import { departments, getDb } from '@nexora/database';
import { createDepartmentSchema, updateDepartmentSchema } from '@nexora/validation';
import { ApiError, clientIp, isUniqueViolation, parseBody } from '../../lib/errors';
import { writeAudit } from '../../lib/audit';
import { requirePermission } from '../../middleware/organization';
import type { AppEnv } from '../../types';

export function buildDepartmentRoutes() {
  const routes = new Hono<AppEnv>();
  const orgScoped = (id: string, orgId: string) =>
    and(eq(departments.id, id), eq(departments.organizationId, orgId));

  routes.get('/', requirePermission('departments.read'), async (c) => {
    const orgCtx = c.get('org')!;
    const rows = await getDb()
      .select()
      .from(departments)
      .where(eq(departments.organizationId, orgCtx.organizationId))
      .orderBy(asc(departments.name));
    return c.json({ departments: rows });
  });

  routes.post('/', requirePermission('departments.create'), async (c) => {
    const orgCtx = c.get('org')!;
    const input = await parseBody(c, createDepartmentSchema);
    try {
      const [department] = await getDb()
        .insert(departments)
        .values({
          organizationId: orgCtx.organizationId,
          name: input.name,
          description: input.description ?? null,
        })
        .returning();
      await writeAudit(getDb(), {
        organizationId: orgCtx.organizationId,
        actorUserId: c.get('session')!.id,
        action: 'department.created',
        entityType: 'department',
        entityId: department!.id,
        metadata: { name: input.name },
        ip: clientIp(c),
      });
      return c.json({ department }, 201);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw ApiError.conflict('A department with this name already exists');
      }
      throw err;
    }
  });

  routes.patch('/:departmentId', requirePermission('departments.update'), async (c) => {
    const orgCtx = c.get('org')!;
    const input = await parseBody(c, updateDepartmentSchema);
    const db = getDb();

    try {
      const [updated] = await db
        .update(departments)
        .set({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          updatedAt: new Date(),
        })
        .where(orgScoped(c.req.param('departmentId'), orgCtx.organizationId))
        .returning();
      if (!updated) throw ApiError.notFound('Department not found');
      return c.json({ department: updated });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw ApiError.conflict('A department with this name already exists');
      }
      throw err;
    }
  });

  routes.delete('/:departmentId', requirePermission('departments.delete'), async (c) => {
    const orgCtx = c.get('org')!;
    const db = getDb();

    const deleted = await db
      .delete(departments)
      .where(orgScoped(c.req.param('departmentId'), orgCtx.organizationId))
      .returning({ id: departments.id });
    if (deleted.length === 0) throw ApiError.notFound('Department not found');

    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: c.get('session')!.id,
      action: 'department.deleted',
      entityType: 'department',
      entityId: c.req.param('departmentId'),
      ip: clientIp(c),
    });
    return c.json({ ok: true });
  });

  return routes;
}
