import type { FastifyInstance } from "fastify";
import { hasPermission } from "@peopleflow/auth";
import {
  createFeedbackSchema,
  createGoalSchema,
  createReviewCycleSchema,
  submitReviewSchema,
  updateGoalSchema,
} from "@peopleflow/validation";
import { badRequest, forbidden, isManagerOf, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";

export async function performanceRoutes(app: FastifyInstance): Promise<void> {
  // ── Goals ──────────────────────────────────────────────────────────────────
  app.get("/goals", async (request) => {
    const ctx = requireCtx(request);
    const employeeId = (request.query as { employeeId?: string }).employeeId;

    if (employeeId && employeeId !== ctx.employeeId) {
      const allowed =
        hasPermission(ctx.permissions, "performance.viewAll") ||
        hasPermission(ctx.permissions, "employee.view") ||
        (ctx.employeeId ? await isManagerOf(ctx.db, ctx.employeeId, employeeId) : false);
      if (!allowed) throw forbidden();
    }

    const where = employeeId ? { employeeId } : { OR: [{ employeeId: ctx.employeeId ?? "__none__" }] };
    if (hasPermission(ctx.permissions, "performance.viewAll") && !employeeId) {
      delete where.OR;
    }
    const rows = await ctx.db.goal.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
    return { data: rows };
  });

  app.post("/goals", async (request, reply) => {
    const ctx = requireCtx(request);
    const input = createGoalSchema.parse(request.body);
    if (input.employeeId !== ctx.employeeId) {
      const allowed =
        hasPermission(ctx.permissions, "performance.manage") &&
        (hasPermission(ctx.permissions, "performance.viewAll") ||
          (ctx.employeeId ? await isManagerOf(ctx.db, ctx.employeeId, input.employeeId) : false));
      if (!allowed) throw forbidden("You can only create goals for yourself or your reports");
    }
    const row = await ctx.db.goal.create({
      data: {
        organizationId: ctx.organizationId,
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null,
        status: "ACTIVE",
        employeeId: input.employeeId,
      },
    });
    return reply.code(201).send(row);
  });

  app.patch("/goals/:id", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const input = updateGoalSchema.parse(request.body);

    const goal = await ctx.db.goal.findFirst({ where: { id }, include: { employee: { select: { id: true, managerId: true, userId: true } } } });
    if (!goal) throw notFound();

    const isSelf = goal.employee.userId === ctx.userId;
    const managesReport =
      hasPermission(ctx.permissions, "performance.manage") &&
      (ctx.employeeId === goal.employee.managerId || hasPermission(ctx.permissions, "performance.viewAll"));
    if (!isSelf && !managesReport) throw forbidden();

    return ctx.db.goal.update({
      where: { id: goal.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null } : {}),
        ...(input.progress !== undefined
          ? managesReport || isSelf
            ? { progress: input.progress }
            : undefined
          : {}),
        ...(input.status !== undefined && (managesReport || isSelf) ? { status: input.status } : {}),
      },
    });
  });

  // ── Review cycles & reviews ────────────────────────────────────────────────
  app.get("/review-cycles", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "performance.manage");
    return { data: await ctx.db.reviewCycle.findMany({ orderBy: { periodStart: "desc" }, take: 50 }) };
  });

  app.post("/review-cycles", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "performance.manage");
    const input = createReviewCycleSchema.parse(request.body);
    const row = await ctx.db.reviewCycle.create({
      data: {
        organizationId: ctx.organizationId,
        name: input.name,
        periodStart: new Date(`${input.periodStart}T00:00:00.000Z`),
        periodEnd: new Date(`${input.periodEnd}T00:00:00.000Z`),
      },
    });
    return reply.code(201).send(row);
  });

  app.get("/reviews", async (request) => {
    const ctx = requireCtx(request);
    const cycleId = (request.query as { cycleId?: string }).cycleId;
    if (!cycleId) throw badRequest("cycleId is required");

    const reviews = await ctx.db.review.findMany({
      where: { cycleId },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, managerId: true, userId: true } },
      },
    });

    const filtered = [];
    for (const review of reviews) {
      const canSee =
        review.employee.userId === ctx.userId ||
        review.managerUserId === ctx.userId ||
        hasPermission(ctx.permissions, "performance.viewAll") ||
        (ctx.employeeId && review.employee.managerId === ctx.employeeId);
      if (canSee) {
        filtered.push({
          id: review.id,
          status: review.status,
          selfRating: review.selfRating,
          managerRating: review.managerRating,
          employee: { id: review.employee.id, firstName: review.employee.firstName, lastName: review.employee.lastName },
        });
      }
    }
    return { data: filtered };
  });

  app.post("/review-cycles/:cycleId/reviews", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "performance.manage");
    const { cycleId } = request.params as { cycleId: string };
    const employeeId = (request.body as { employeeId?: string })?.employeeId;
    if (!employeeId) throw badRequest("employeeId is required");

    const cycle = await ctx.db.reviewCycle.findFirst({ where: { id: cycleId }, select: { id: true } });
    if (!cycle) throw notFound("Cycle not found");
    const employee = await ctx.db.employee.findFirst({
      where: { id: employeeId },
      select: { id: true, manager: { select: { userId: true } } },
    });
    if (!employee) throw badRequest("Employee not found in this organization");

    const review = await ctx.db.review.upsert({
      where: { cycleId_employeeId: { cycleId: cycle.id, employeeId: employee.id } },
      create: {
        organizationId: ctx.organizationId,
        cycleId: cycle.id,
        employeeId: employee.id,
        managerUserId: employee.manager?.userId ?? null,
      },
      update: {},
    });
    return reply.code(201).send(review);
  });

  app.post("/reviews/:id/submit", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const input = submitReviewSchema.parse(request.body);

    const review = await ctx.db.review.findFirst({
      where: { id },
      include: { employee: { select: { id: true, userId: true, managerId: true } } },
    });
    if (!review) throw notFound();

    if (input.role === "SELF") {
      if (review.employee.userId !== ctx.userId) throw forbidden();
      if (review.status !== "NOT_STARTED" && review.status !== "SELF_SUBMITTED") {
        throw badRequest("Self-review already submitted");
      }
      return ctx.db.review.update({
        where: { id: review.id },
        data: {
          selfRating: input.rating ?? null,
          selfComments: input.comments,
          status: "SELF_SUBMITTED",
        },
      });
    }

    const isManager =
      review.managerUserId === ctx.userId ||
      (ctx.employeeId && review.employee.managerId === ctx.employeeId);
    if (!isManager && !hasPermission(ctx.permissions, "performance.viewAll")) throw forbidden();

    return ctx.db.review.update({
      where: { id: review.id },
      data: {
        managerRating: input.rating ?? null,
        managerComments: input.comments,
        status: "COMPLETED",
      },
    });
  });

  // ── Peer feedback ──────────────────────────────────────────────────────────
  app.get("/feedback", async (request) => {
    const ctx = requireCtx(request);
    const aboutEmployeeId = (request.query as { aboutEmployeeId?: string }).aboutEmployeeId;
    if (!aboutEmployeeId) throw badRequest("aboutEmployeeId is required");

    const target = await ctx.db.employee.findFirst({
      where: { id: aboutEmployeeId },
      select: { userId: true, managerId: true },
    });
    if (!target) throw notFound();

    const canViewAll = hasPermission(ctx.permissions, "performance.viewAll");
    const canSee =
      target.userId === ctx.userId ||
      target.managerId === ctx.employeeId ||
      canViewAll ||
      aboutEmployeeId === ctx.employeeId;
    if (!canSee) throw forbidden();

    const rows = await ctx.db.feedback.findMany({
      where: { aboutEmployeeId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      data: rows.map((f) => ({
        id: f.id,
        message: f.message,
        createdAt: f.createdAt,
        from: f.anonymous && !canViewAll ? "Anonymous" : f.fromEmployeeId,
      })),
    };
  });

  app.post("/feedback", async (request, reply) => {
    const ctx = requireCtx(request);
    const input = createFeedbackSchema.parse(request.body);
    if (!ctx.employeeId) throw forbidden("Your user is not linked to an employee profile");
    const target = await ctx.db.employee.findFirst({ where: { id: input.aboutEmployeeId }, select: { id: true } });
    if (!target) throw badRequest("Employee not found in this organization");
    const row = await ctx.db.feedback.create({
      data: {
        organizationId: ctx.organizationId,
        aboutEmployeeId: input.aboutEmployeeId,
        fromEmployeeId: ctx.employeeId,
        message: input.message,
        anonymous: input.anonymous,
      },
    });
    return reply.code(201).send({ id: row.id });
  });
}
