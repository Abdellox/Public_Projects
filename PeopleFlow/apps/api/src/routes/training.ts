import type { FastifyInstance } from "fastify";
import {
  assignTrainingSchema,
  completeTrainingSchema,
  createCourseSchema,
} from "@peopleflow/validation";
import { badRequest, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { notifyMany } from "../services/notifications.js";

export async function trainingRoutes(app: FastifyInstance): Promise<void> {
  app.get("/courses", async (request) => {
    const ctx = requireCtx(request);
    return {
      data: await ctx.db.course.findMany({
        where: { archivedAt: null },
        orderBy: { title: "asc" },
        include: { _count: { select: { assignments: true } } },
      }),
    };
  });

  app.post("/courses", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "training.manage");
    const input = createCourseSchema.parse(request.body);
    const row = await ctx.db.course.create({
      data: {
        organizationId: ctx.organizationId,
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? null,
        contentUrl: input.contentUrl ?? null,
        durationHours: input.durationHours ?? null,
        certificationValidMonths: input.certificationValidMonths ?? null,
      },
    });
    return reply.code(201).send(row);
  });

  app.patch("/courses/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "training.manage");
    const { id } = request.params as { id: string };
    await ctx.db.course.updateMany({ where: { id }, data: { archivedAt: new Date() } });
    return { ok: true };
  });

  app.get("/trainings", async (request) => {
    const ctx = requireCtx(request);
    const employeeId = (request.query as { employeeId?: string }).employeeId;
    const scopeAll = employeeId && employeeId !== ctx.employeeId;

    if (scopeAll) {
      requirePermission(ctx.permissions, "training.manage");
    }

    const targetEmployeeId = scopeAll ? employeeId : ctx.employeeId;
    if (!targetEmployeeId && !employeeId) {
      requirePermission(ctx.permissions, "training.manage");
    }

    const rows = await ctx.db.trainingAssignment.findMany({
      where: targetEmployeeId ? { employeeId: targetEmployeeId } : undefined,
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      take: 200,
      include: {
        course: { select: { id: true, title: true, category: true, durationHours: true } },
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    const now = Date.now();
    return {
      data: rows.map((r) => ({
        ...r,
        overdue:
          r.status !== "COMPLETED" &&
          r.dueDate.getTime() < now,
      })),
    };
  });

  app.post("/trainings/assign", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "training.manage");
    const input = assignTrainingSchema.parse(request.body);

    const course = await ctx.db.course.findFirst({ where: { id: input.courseId, archivedAt: null } });
    if (!course) throw badRequest("Course not found");

    const created: string[] = [];
    for (const employeeId of input.employeeIds) {
      const employee = await ctx.db.employee.findFirst({
        where: { id: employeeId },
        select: { id: true, userId: true },
      });
      if (!employee) continue;

      const existing = await ctx.db.trainingAssignment.findFirst({
        where: { courseId: course.id, employeeId: employee.id, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        select: { id: true },
      });
      if (existing) continue;

      await ctx.db.trainingAssignment.create({
        data: {
          organizationId: ctx.organizationId,
          courseId: course.id,
          employeeId: employee.id,
          dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
          assignedById: ctx.userId,
        },
      });
      created.push(employee.id);

      if (employee.userId) {
        await notifyMany({
          userIds: [employee.userId],
          type: "TRAINING_ASSIGNED",
          title: `New training assigned: ${course.title}`,
          body: `Due ${input.dueDate}`,
          link: "/training",
        });
      }
    }
    return reply.code(201).send({ assigned: created.length });
  });

  app.post("/trainings/:id/complete", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const input = completeTrainingSchema.parse(request.body ?? {});

    const assignment = await ctx.db.trainingAssignment.findFirst({
      where: { id },
      include: { employee: { select: { id: true, userId: true } }, course: { select: { title: true, certificationValidMonths: true } } },
    });
    if (!assignment) throw notFound();

    const isSelf = assignment.employee.userId === ctx.userId;
    if (!isSelf) requirePermission(ctx.permissions, "training.manage");

    const completedAt = input.completedAt ? new Date(`${input.completedAt}T00:00:00.000Z`) : new Date();

    await ctx.db.trainingAssignment.update({
      where: { id: assignment.id },
      data: { status: "COMPLETED", completedAt },
    });

    let certificationId: string | null = null;
    if (assignment.course.certificationValidMonths) {
      const expiresAt = new Date(completedAt);
      expiresAt.setUTCMonth(expiresAt.getUTCMonth() + assignment.course.certificationValidMonths);
      const cert = await ctx.db.certification.create({
        data: {
          organizationId: ctx.organizationId,
          employeeId: assignment.employee.id,
          name: assignment.course.title,
          issuedAt: completedAt,
          expiresAt,
          assignmentId: assignment.id,
        },
      });
      certificationId = cert.id;
    }

    return { ok: true, certificationId };
  });

  app.get("/certifications", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "training.manage");
    const days = Number((request.query as { expiringWithinDays?: string }).expiringWithinDays ?? "60");
    const cutoff = new Date(Date.now() + (Number.isFinite(days) ? days : 60) * 864e5);

    const rows = await ctx.db.certification.findMany({
      where: { expiresAt: { lte: cutoff } },
      orderBy: { expiresAt: "asc" },
      take: 100,
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
    return { data: rows };
  });
}
