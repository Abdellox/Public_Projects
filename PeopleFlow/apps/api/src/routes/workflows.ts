import type { FastifyInstance } from "fastify";
import { instantiateWorkflow } from "@peopleflow/workflows";
import { createWorkflowTemplateSchema, runWorkflowSchema } from "@peopleflow/validation";
import { badRequest, forbidden, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { audit } from "../services/audit.js";
import { clientIp } from "../lib/cookies.js";

export async function workflowRoutes(app: FastifyInstance): Promise<void> {
  app.get("/workflows/templates", async (request) => {
    const ctx = requireCtx(request);
    return {
      data: await ctx.db.workflowTemplate.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true, name: true, trigger: true, steps: true, createdAt: true,
          _count: { select: { runs: true } },
        },
      }),
    };
  });

  app.post("/workflows/templates", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "workflow.manage");
    const input = createWorkflowTemplateSchema.parse(request.body);
    const template = await ctx.db.workflowTemplate.create({
      data: { organizationId: ctx.organizationId, name: input.name, trigger: input.trigger, steps: input.steps as never },
    });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "workflow.template_created",
      entityType: "WorkflowTemplate",
      entityId: template.id,
      ip: clientIp(request),
    });
    return reply.code(201).send(template);
  });

  app.delete("/workflows/templates/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "workflow.manage");
    const { id } = request.params as { id: string };
    await ctx.db.workflowTemplate.deleteMany({ where: { id } });
    return { ok: true };
  });

  app.get("/workflows/runs", async (request) => {
    const ctx = requireCtx(request);
    const rows = await ctx.db.workflowRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 100,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        template: { select: { id: true, name: true, trigger: true } },
      },
    });
    const withProgress = await Promise.all(
      rows.map(async (run) => {
        const [total, done] = await Promise.all([
          ctx.db.task.count({ where: { workflowRunId: run.id, status: { not: "CANCELLED" } } }),
          ctx.db.task.count({ where: { workflowRunId: run.id, status: "DONE" } }),
        ]);
        return { ...run, progress: { total, done } };
      }),
    );
    return { data: withProgress };
  });

  app.post("/workflows/runs", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "workflow.manage");
    const input = runWorkflowSchema.parse(request.body);

    const template = await ctx.db.workflowTemplate.findFirst({
      where: { id: input.templateId },
    });
    if (!template) throw notFound("Workflow template not found");

    const employee = await ctx.db.employee.findFirst({
      where: { id: input.employeeId },
      select: { id: true, startDate: true, managerId: true, department: { select: { managerEmployeeId: true } } },
    });
    if (!employee) throw badRequest("Employee not found in this organization");

    const anchor =
      template.trigger === "OFFBOARDING"
        ? new Date()
        : employee.startDate;

    let taskSpecs;
    try {
      taskSpecs = instantiateWorkflow(template.steps, anchor);
    } catch (e) {
      throw badRequest("Workflow template has invalid steps");
    }

    const hrUsers = await ctx.db.membership.findMany({
      where: { role: { permissions: { has: "workflow.manage" } } },
      select: { userId: true },
      take: 20,
    });

    const run = await ctx.db.workflowRun.create({
      data: { organizationId: ctx.organizationId, templateId: template.id, employeeId: employee.id },
    });

    await ctx.db.task.createMany({
      data: taskSpecs.map((spec, index) => ({
        organizationId: ctx.organizationId,
        title: spec.title,
        description:
          spec.roleKey === "MANAGER" ? `${spec.description ?? spec.title} (manager action)` : (spec.description ?? null),
        assigneeEmployeeId:
          spec.roleKey === "ASSIGNEE"
            ? employee.id
            : spec.roleKey === "MANAGER"
              ? (employee.managerId ?? null)
              : null,
        dueDate: spec.dueDate,
        status: "TODO",
        priority: "MEDIUM",
        workflowRunId: run.id,
        workflowStepIndex: index,
      })),
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: `workflow.run_started`,
      entityType: "WorkflowRun",
      entityId: run.id,
      metadata: { templateName: template.name, tasks: taskSpecs.length },
      ip: clientIp(request),
    });

    void hrUsers;
    return reply.code(201).send({ id: run.id, tasks: taskSpecs.length });
  });
}
