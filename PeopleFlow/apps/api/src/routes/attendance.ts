import type { FastifyInstance } from "fastify";
import { clockActionSchema, listAttendanceQuery, manualAttendanceSchema, upsertWorkScheduleSchema } from "@peopleflow/validation";
import { hasPermission } from "@peopleflow/auth";
import { badRequest, forbidden, notFound, requirePermission } from "../lib/errors.js";
import { meta, pageQuery, skipTake } from "../lib/pagination.js";
import { requireCtx } from "../context.js";

function dayStartUtc(d = new Date()): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export async function attendanceRoutes(app: FastifyInstance): Promise<void> {
  app.post("/attendance/clock-in", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "attendance.clock");
    if (!ctx.employeeId) throw forbidden("Your user is not linked to an employee profile");
    const input = clockActionSchema.parse(request.body ?? {});
    const at = input.at ? new Date(input.at) : new Date();
    const date = dayStartUtc(at);

    const existing = await ctx.db.attendanceEntry.findUnique({
      where: { employeeId_date: { employeeId: ctx.employeeId, date } },
    });
    if (existing?.clockIn) throw badRequest("Already clocked in today");
    if (existing) {
      await ctx.db.attendanceEntry.update({
        where: { id: existing.id },
        data: { clockIn: at },
      });
      return { ok: true, clockIn: at };
    }
      const entry = await ctx.db.attendanceEntry.create({
      data: {
        organizationId: ctx.organizationId,
        employeeId: ctx.employeeId,
        date,
        clockIn: at,
        note: input.note ?? null,
      },
    });
    return { ok: true, clockIn: entry.clockIn };
  });

  app.post("/attendance/clock-out", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "attendance.clock");
    if (!ctx.employeeId) throw forbidden("Your user is not linked to an employee profile");
    const input = clockActionSchema.parse(request.body ?? {});
    const at = input.at ? new Date(input.at) : new Date();
    const date = dayStartUtc(at);

    const entry = await ctx.db.attendanceEntry.findUnique({
      where: { employeeId_date: { employeeId: ctx.employeeId, date } },
    });
    if (!entry?.clockIn) throw badRequest("You have not clocked in yet today");
    if (entry.clockOut) throw badRequest("Already clocked out");

    const workedMs = Math.max(0, at.getTime() - entry.clockIn.getTime() - entry.breakMinutes * 60000);
    const updated = await ctx.db.attendanceEntry.update({
      where: { id: entry.id },
      data: {
        clockOut: at,
        workedMinutes: Math.round(workedMs / 60000),
        overtimeMinutes: Math.max(0, Math.round(workedMs / 60000) - 480),
      },
    });
    return { ok: true, workedMinutes: updated.workedMinutes };
  });

  app.get("/attendance/today", async (request) => {
    const ctx = requireCtx(request);
    if (!ctx.employeeId) return { entry: null };
    const entry = await ctx.db.attendanceEntry.findUnique({
      where: { employeeId_date: { employeeId: ctx.employeeId, date: dayStartUtc() } },
    });
    return { entry };
  });

  app.get("/attendance", async (request) => {
    const ctx = requireCtx(request);
    const query = listAttendanceQuery.parse(request.query);
    const page = pageQuery.parse({ page: query.page, pageSize: query.pageSize });

    let employeeId = ctx.employeeId;
    if (query.employeeId && query.employeeId !== ctx.employeeId) {
      requirePermission(ctx.permissions, hasPermission(ctx.permissions, "attendance.viewAll") ? "attendance.viewAll" : "__denied__");
      employeeId = query.employeeId;
    }
    if (!employeeId) return { data: [], meta: meta(0, page) };

    const where = {
      employeeId,
      ...(query.from || query.to
        ? { date: { ...(query.from ? { gte: new Date(`${query.from}T00:00:00.000Z`) } : {}), ...(query.to ? { lte: new Date(`${query.to}T00:00:00.000Z`) } : {}) } }
        : {}),
    };

    const [total, rows] = await Promise.all([
      ctx.db.attendanceEntry.count({ where }),
      ctx.db.attendanceEntry.findMany({
        where,
        orderBy: { date: "desc" },
        ...skipTake(page),
      }),
    ]);
    return { data: rows, meta: meta(total, page) };
  });

  app.post("/attendance/manual", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "attendance.manage");
    const input = manualAttendanceSchema.parse(request.body);
    const [inH, inM] = input.clockIn.split(":").map(Number);
    const [outH, outM] = input.clockOut.split(":").map(Number);
    const date = new Date(`${input.date}T00:00:00.000Z`);
    const clockIn = new Date(date); clockIn.setUTCHours(inH, inM, 0, 0);
    const clockOut = new Date(date); clockOut.setUTCHours(outH, outM, 0, 0);
    if (clockOut <= clockIn) throw badRequest("Clock out must be after clock in");
    const worked = Math.round((clockOut.getTime() - clockIn.getTime()) / 60000) - input.breakMinutes;
    if (worked < 0) throw badRequest("Break time exceeds the working period");

    const row = await ctx.db.attendanceEntry.upsert({
      where: { employeeId_date: { employeeId: input.employeeId, date } },
      create: {
        organizationId: ctx.organizationId,
        employeeId: input.employeeId,
        date,
        clockIn,
        clockOut,
        breakMinutes: input.breakMinutes,
        workedMinutes: worked,
        source: "manual",
        note: input.note ?? null,
      },
      update: {
        clockIn,
        clockOut,
        breakMinutes: input.breakMinutes,
        workedMinutes: worked,
        source: "manual",
        note: input.note ?? null,
      },
    });
    return reply.code(201).send(row);
  });

  // ── Work schedules ─────────────────────────────────────────────────────────
  app.get("/schedules", async (request) => {
    const ctx = requireCtx(request);
    return { data: await ctx.db.workSchedule.findMany({ orderBy: { name: "asc" } }) };
  });

  app.put("/schedules/:id", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const input = upsertWorkScheduleSchema.parse(request.body);
    const sorted = [...input.days].sort((a, b) => a.day - b.day);
    const row = await ctx.db.workSchedule.upsert({
      where: { organizationId_name: { organizationId: ctx.organizationId, name: input.name } },
      create: { organizationId: ctx.organizationId, name: input.name, days: sorted as never, isDefault: false },
      update: { days: sorted as never, isDefault: false },
    }).catch(async () =>
      ctx.db.workSchedule.update({
        where: { organizationId_name: { organizationId: ctx.organizationId, name: input.name } },
        data: { days: sorted as never },
      }),
    );
    if (id && id !== "new") {
      await ctx.db.workSchedule.updateMany({
        where: { id, name: input.name, organizationId: ctx.organizationId },
        data: { days: sorted as never },
      });
    }
    return reply.send(row);
  });

  app.delete("/schedules/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const existing = await ctx.db.workSchedule.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    await ctx.db.workSchedule.delete({ where: { id: existing.id } });
    return { ok: true };
  });
}
