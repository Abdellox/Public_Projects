import type { FastifyInstance } from "fastify";
import { hasPermission } from "@peopleflow/auth";
import { requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  app.get("/reports/summary", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "report.view");

    const query = request.query as {
      from?: string;
      to?: string;
      departmentId?: string;
      locationId?: string;
      employmentType?: string;
    };

    const baseWhere: Record<string, unknown> = {};
    if (query.departmentId) baseWhere.departmentId = query.departmentId;
    if (query.locationId) baseWhere.locationId = query.locationId;
    if (query.employmentType) baseWhere.employmentType = query.employmentType;

    const now = new Date();
    const from = query.from ? new Date(`${query.from}T00:00:00.000Z`) : new Date(now.getTime() - 365 * 864e5);
    const to = query.to ? new Date(`${query.to}T00:00:00.000Z`) : now;

    const [headcount, active, byDepartment, byEmploymentType, byLocation, newHires, departures, leaveDays] =
      await Promise.all([
        ctx.db.employee.count({ where: { ...baseWhere, terminationDate: null } }),
        ctx.db.employee.count({
          where: { ...baseWhere, terminationDate: null, status: { category: "ACTIVE" } },
        }),
        ctx.db.employee.groupBy({
          by: ["departmentId"],
          where: { ...baseWhere, terminationDate: null },
          _count: true,
        }),
        ctx.db.employee.groupBy({
          by: ["employmentType"],
          where: { ...baseWhere, terminationDate: null },
          _count: true,
        }),
        ctx.db.employee.groupBy({
          by: ["locationId"],
          where: { ...baseWhere, terminationDate: null },
          _count: true,
        }),
        ctx.db.employee.count({ where: { ...baseWhere, startDate: { gte: from, lte: to } } }),
        ctx.db.employee.count({ where: { ...baseWhere, terminationDate: { gte: from, lte: to } } }),
        ctx.db.leaveRequest.aggregate({
          _sum: { days: true },
          where: {
            status: "APPROVED",
            startDate: { gte: from },
            endDate: { lte: to },
            ...(query.departmentId ? { employee: { departmentId: query.departmentId } } : {}),
          },
        }),
      ]);

    const deptIds = byDepartment.map((d) => d.departmentId).filter((x): x is string => Boolean(x));
    const locIds = byLocation.map((l) => l.locationId).filter((x): x is string => Boolean(x));
    const [departments, locations] = await Promise.all([
      deptIds.length ? ctx.db.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, name: true } }) : [],
      locIds.length ? ctx.db.location.findMany({ where: { id: { in: locIds } }, select: { id: true, name: true } }) : [],
    ]);

    return {
      headcount,
      active,
      newHires: newHires,
      departures,
      turnoverRate: headcount > 0 ? Number(((departures / headcount) * 100).toFixed(1)) : 0,
      absenceDaysApproved: leaveDays._sum.days ?? 0,
      byDepartment: byDepartment.map((row) => ({
        name: departments.find((d) => d.id === row.departmentId)?.name ?? "Unassigned",
        count: row._count,
      })),
      byEmploymentType: byEmploymentType.map((row) => ({ type: row.employmentType, count: row._count })),
      byLocation: byLocation.map((row) => ({
        name: locations.find((l) => l.id === row.locationId)?.name ?? "Unassigned",
        count: row._count,
      })),
    };
  });

  app.get("/reports/recruitment", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "report.view");
    requirePermission(ctx.permissions, "recruitment.manage");

    const [openJobs, applicationsByStage, interviewsUpcoming] = await Promise.all([
      ctx.db.jobOpening.count({ where: { status: "OPEN" } }),
      ctx.db.application.groupBy({ by: ["stage"], _count: true }),
      ctx.db.interview.count({
        where: { scheduledAt: { gte: new Date() } },
      }),
    ]);
    return {
      openJobs,
      upcomingInterviews: interviewsUpcoming,
      pipeline: applicationsByStage.map((s) => ({ stage: s.stage, count: s._count })),
    };
  });
}
