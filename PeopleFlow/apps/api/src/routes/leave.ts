import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import {
  createLeaveRequestSchema,
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
  decideLeaveRequestSchema,
  cancelLeaveRequestSchema,
  listLeaveRequestsQuery,
  createHolidaySchema,
} from "@peopleflow/validation";
import { hasPermission } from "@peopleflow/auth";
import { badRequest, forbidden, isManagerOf, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { adjustBalancesOnCreate, applyDecision, assertNoOverlap, workingDaysBetween } from "../services/leave.js";
import { notifyMany, usersWithPermission } from "../services/notifications.js";
import { audit } from "../services/audit.js";
import { clientIp } from "../lib/cookies.js";

function dayStart(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function leaveRoutes(app: FastifyInstance): Promise<void> {
  // ── Leave types (configuration) ────────────────────────────────────────────
  app.get("/leave/types", async (request) => {
    const ctx = requireCtx(request);
    return {
      data: await ctx.db.leaveType.findMany({
        where: { archivedAt: null },
        orderBy: { name: "asc" },
      }),
    };
  });

  app.post("/leave/types", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = createLeaveTypeSchema.parse(request.body);
    const row = await ctx.db.leaveType.create({ data: { ...input, organizationId: ctx.organizationId } });
    return reply.code(201).send(row);
  });

  app.patch("/leave/types/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const input = updateLeaveTypeSchema.parse(request.body);
    const existing = await ctx.db.leaveType.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    return ctx.db.leaveType.update({ where: { id: existing.id }, data: input });
  });

  app.delete("/leave/types/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    await ctx.db.leaveType.updateMany({ where: { id }, data: { archivedAt: new Date() } });
    return { ok: true };
  });

  app.get("/leave/holidays", async (request) => {
    const ctx = requireCtx(request);
    return {
      data: await ctx.db.publicHoliday.findMany({ orderBy: { date: "asc" } }),
    };
  });

  app.post("/leave/holidays", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = createHolidaySchema.parse(request.body);
    const row = await ctx.db.publicHoliday.create({
      data: {
        organizationId: ctx.organizationId,
        name: input.name,
        date: dayStart(input.date),
        locationId: input.locationId ?? null,
      },
    });
    return reply.code(201).send(row);
  });

  app.delete("/leave/holidays/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    await ctx.db.publicHoliday.deleteMany({ where: { id } });
    return { ok: true };
  });

  // ── Balances ───────────────────────────────────────────────────────────────
  app.get("/leave/balances", async (request) => {
    const ctx = requireCtx(request);
    const employeeId = (request.query as { employeeId?: string }).employeeId;
    if (employeeId && employeeId !== ctx.employeeId) {
      const allowed =
        hasPermission(ctx.permissions, "leave.viewAll") ||
        (ctx.employeeId ? await isManagerOf(ctx.db, ctx.employeeId, employeeId) : false);
      if (!allowed) throw forbidden();
    }
    const year = new Date().getUTCFullYear();
    const balances = await ctx.db.leaveBalance.findMany({
      where: { employeeId: employeeId ?? ctx.employeeId ?? "__none__", year },
      include: { leaveType: { select: { id: true, name: true, color: true } } },
    });
    return { data: balances.map((b) => ({ ...b, remaining: b.entitled + b.carriedOver - b.used - b.pending })) };
  });

  // ── Requests ───────────────────────────────────────────────────────────────
  app.get("/leave/requests", async (request) => {
    const ctx = requireCtx(request);
    const query = listLeaveRequestsQuery.parse(request.query);

    const scope = query.scope;
    if ((scope === "all" && !hasPermission(ctx.permissions, "leave.viewAll")) ||
        (scope === "team" && !hasPermission(ctx.permissions, "leave.approve"))) {
      throw forbidden("You cannot view leave requests in this scope");
    }

    const where: Record<string, unknown> = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.departmentId ? { employee: { departmentId: query.departmentId } } : {}),
    };
    if (query.from) {
      where.endDate = { gte: dayStart(query.from) };
    }
    if (query.to) {
      where.startDate = { lte: dayStart(query.to) };
    }

    if (scope === "mine") {
      where.employeeId = ctx.employeeId ?? "__none__";
    } else if (scope === "team") {
      if (!ctx.employeeId) where.employeeId = "__none__";
      else where.employee = { managerId: ctx.employeeId };
    }

    const rows = await ctx.db.leaveRequest.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, startDate: true, endDate: true, days: true, status: true, reason: true,
        decisionNote: true, createdAt: true, decidedAt: true,
        employee: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        type: { select: { id: true, name: true, color: true } },
      },
    });
    return { data: rows };
  });

  app.post("/leave/requests", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "leave.request");
    if (!ctx.employeeId) throw forbidden("Your user is not linked to an employee profile");

    const input = createLeaveRequestSchema.parse(request.body);
    const startDate = dayStart(input.startDate);
    const endDate = dayStart(input.endDate);

    const type = await ctx.db.leaveType.findFirst({ where: { id: input.leaveTypeId, archivedAt: null } });
    if (!type) throw badRequest("Leave type not found");

    const days = workingDaysBetween(startDate, endDate);
    if (days <= 0) throw badRequest("The selected range contains no working days");

    await assertNoOverlap(ctx.db, ctx.employeeId, startDate, endDate);

    let requestRow;
    await ctx.db.$transaction(async (tx) => {
      requestRow = await tx.leaveRequest.create({
        data: {
          organizationId: ctx.organizationId,
          employeeId: ctx.employeeId!,
          leaveTypeId: type.id,
          startDate,
          endDate,
          days,
          reason: input.reason ?? null,
          status: type.requiresApproval ? "PENDING" : "APPROVED",
          approverUserId: type.requiresApproval ? null : ctx.userId,
          decidedAt: type.requiresApproval ? null : new Date(),
        },
      });
      await adjustBalancesOnCreate(tx as Prisma.TransactionClient, {
        organizationId: ctx.organizationId,
        employeeId: ctx.employeeId!,
        leaveTypeId: type.id,
        startDate,
        days,
      });
    });

    if (type.requiresApproval) {
      const approvers = await usersWithPermission(ctx.db, ctx.organizationId, "leave.viewAll");
      await notifyMany({
        userIds: approvers,
        type: "LEAVE_REQUESTED",
        title: `${ctx.name} requested ${type.name}`,
        body: `${days} day(s), starting ${input.startDate}`,
        link: `/approvals`,
      });
    }

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "leave.request_created",
      entityType: "LeaveRequest",
      entityId: requestRow!.id,
      metadata: { days, startDate: input.startDate, endDate: input.endDate },
      ip: clientIp(request),
    });

    return reply.code(201).send(requestRow);
  });

  app.post("/leave/requests/:id/decide", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "leave.approve");
    const { id } = request.params as { id: string };
    const input = decideLeaveRequestSchema.parse(request.body);

    const leave = await ctx.db.leaveRequest.findFirst({
      where: { id },
      include: { type: { select: { name: true } }, employee: { select: { id: true, firstName: true, lastName: true, managerId: true } } },
    });
    if (!leave) throw notFound();

    const isHrScope = hasPermission(ctx.permissions, "leave.viewAll");
    const isLineManager = Boolean(ctx.employeeId && leave.employee.managerId === ctx.employeeId);
    if (!isHrScope && !isLineManager) {
      throw forbidden("Only the line manager or HR can decide this request");
    }
    if (leave.status !== "PENDING") throw badRequest(`Request is already ${leave.status.toLowerCase()}`);

    const decision = input.decision === "APPROVE" ? "APPROVED" : "REJECTED";

    await ctx.db.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id: leave.id },
        data: {
          status: decision,
          approverUserId: ctx.userId,
          decidedAt: new Date(),
          decisionNote: input.note ?? null,
        },
      });
      await applyDecision(tx as Prisma.TransactionClient, leave, decision);
    });

    const employeeUserId = await ctx.db.employee.findUnique({
      where: { id: leave.employee.id },
      select: { userId: true },
    });
    await notifyMany({
      userIds: employeeUserId?.userId ? [employeeUserId.userId] : [],
      type: "LEAVE_DECIDED",
      title: `Your ${leave.type.name} request was ${decision.toLowerCase()}`,
      link: "/leave",
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: `leave.${decision.toLowerCase()}`,
      entityType: "LeaveRequest",
      entityId: leave.id,
      ip: clientIp(request),
    });

    return { ok: true, status: decision };
  });

  app.post("/leave/requests/:id/cancel", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    cancelLeaveRequestSchema.parse(request.body ?? {});

    const leave = await ctx.db.leaveRequest.findFirst({ where: { id } });
    if (!leave) throw notFound();

    const isOwner = leave.employeeId === ctx.employeeId;
    const canCancel = isOwner || hasPermission(ctx.permissions, "leave.viewAll");
    if (!canCancel) throw forbidden();
    if (leave.status === "CANCELLED" || leave.status === "REJECTED") {
      throw badRequest("Request cannot be cancelled in its current state");
    }

    const previousStatus = leave.status;
    await ctx.db.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id: leave.id },
        data: { status: "CANCELLED" },
      });
      await applyDecision(tx as Prisma.TransactionClient, { ...leave, status: previousStatus }, "CANCELLED");
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "leave.cancelled",
      entityType: "LeaveRequest",
      entityId: leave.id,
      ip: clientIp(request),
    });

    return { ok: true };
  });
}
