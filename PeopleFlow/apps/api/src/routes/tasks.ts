import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { hasPermission } from "@peopleflow/auth";
import { createTaskSchema, updateTaskSchema } from "@peopleflow/validation";
import { forbidden, notFound, requirePermission } from "../lib/errors.js";
import { meta, pageQuery, skipTake } from "../lib/pagination.js";
import { requireCtx } from "../context.js";

export async function taskRoutes(app: FastifyInstance): Promise<void> {
  app.get("/tasks", async (request) => {
    const ctx = requireCtx(request);
    const query = pageQuery.parse(request.query);
    const scope = (request.query as { scope?: string }).scope ?? "mine";

    const where: Prisma.TaskWhereInput = {};
    if (scope === "mine") {
      where.assignee = { userId: ctx.userId };
    } else {
      requirePermission(ctx.permissions, "task.manage");
      if ((request.query as { assigneeEmployeeId?: string }).assigneeEmployeeId) {
        where.assigneeEmployeeId = (request.query as { assigneeEmployeeId: string }).assigneeEmployeeId;
      }
      if ((request.query as { status?: string }).status) {
        where.status = (request.query as { status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED" }).status;
      }
    }

    const [total, rows] = await Promise.all([
      ctx.db.task.count({ where }),
      ctx.db.task.findMany({
        where,
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
        ...skipTake(query),
        select: {
          id: true, title: true, description: true, dueDate: true, priority: true, status: true,
          workflowRunId: true, workflowStepIndex: true,
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);
    return { data: rows, meta: meta(total, query) };
  });

  app.post("/tasks", async (request, reply) => {
    const ctx = requireCtx(request);
    const input = createTaskSchema.parse(request.body);

    if (input.assigneeEmployeeId && input.assigneeEmployeeId !== ctx.employeeId) {
      requirePermission(ctx.permissions, "task.manage");
      const target = await ctx.db.employee.findFirst({
        where: { id: input.assigneeEmployeeId },
        select: { id: true },
      });
      if (!target) throw notFound("Assignee not found");
    }

    const task = await ctx.db.task.create({
      data: {
        organizationId: ctx.organizationId,
        title: input.title,
        description: input.description ?? null,
        assigneeEmployeeId: input.assigneeEmployeeId ?? ctx.employeeId ?? null,
        dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null,
        priority: input.priority,
        ...(input.workflowRunId ? { workflowRunId: input.workflowRunId } : {}),
      },
    });
    return reply.code(201).send(task);
  });

  app.patch("/tasks/:id", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const input = updateTaskSchema.parse(request.body);

    const task = await ctx.db.task.findFirst({
      where: { id },
      include: { assignee: { select: { id: true, userId: true } } },
    });
    if (!task) throw notFound();

    const isAssignee = task.assignee?.userId === ctx.userId;
    const canManage = hasPermission(ctx.permissions, "task.manage");
    const reassigning =
      input.assigneeEmployeeId !== undefined && input.assigneeEmployeeId !== task.assigneeEmployeeId;
    if (!isAssignee && !canManage) throw forbidden();
    if (reassigning && !canManage) throw forbidden();

    const updated = await ctx.db.task.update({
      where: { id: task.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(reassigning ? { assigneeEmployeeId: input.assigneeEmployeeId ?? null } : {}),
      },
    });
    return updated;
  });

  app.delete("/tasks/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "task.manage");
    const { id } = request.params as { id: string };
    const existing = await ctx.db.task.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    await ctx.db.task.update({ where: { id: existing.id }, data: { status: "CANCELLED" } });
    return { ok: true };
  });
}
