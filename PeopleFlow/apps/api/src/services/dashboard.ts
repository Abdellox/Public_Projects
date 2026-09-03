import type { RequestContext } from "../context.js";
import { hasPermission } from "@peopleflow/auth";

export async function buildDashboard(ctx: RequestContext) {
  const db = ctx.db;
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();

  const [balances, upcomingLeave, openTasks, trainings, announcements, unread] = await Promise.all([
    ctx.employeeId
      ? db.leaveBalance.findMany({
          where: { employeeId: ctx.employeeId, year },
          select: { entitled: true, used: true, pending: true, carriedOver: true, leaveType: { select: { name: true, color: true } } },
        })
      : Promise.resolve([]),
    ctx.employeeId
      ? db.leaveRequest.findMany({
          where: { employeeId: ctx.employeeId, startDate: { gte: now }, status: "APPROVED" },
          orderBy: { startDate: "asc" },
          take: 3,
          select: { id: true, startDate: true, endDate: true, days: true, type: { select: { name: true, color: true } } },
        })
      : Promise.resolve([]),
    ctx.employeeId
      ? db.task.findMany({
          where: { assignee: { userId: ctx.userId }, status: { in: ["TODO", "IN_PROGRESS"] } },
          orderBy: [{ dueDate: "asc" }],
          take: 8,
          select: { id: true, title: true, dueDate: true, priority: true, status: true },
        })
      : Promise.resolve([]),
    ctx.employeeId
      ? db.trainingAssignment.count({
          where: { employee: { userId: ctx.userId }, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        })
      : Promise.resolve(0),
    db.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      take: 3,
      select: { id: true, title: true, publishedAt: true, pinned: true, authorUser: { select: { name: true } } },
    }),
    db.notification.count({ where: { userId: ctx.userId, readAt: null } }).catch(() => 0),
  ]);

  const dashboard: Record<string, unknown> = {
    balances,
    upcomingLeave,
    tasks: openTasks,
    trainingDue: trainings,
    announcements,
    unreadNotifications: unread,
  };

  if (hasPermission(ctx.permissions, "leave.approve") && !hasPermission(ctx.permissions, "leave.viewAll")) {
    const pending = await db.leaveRequest.findMany({
      where: {
        status: "PENDING",
        employee: { managerId: ctx.employeeId ?? "__none__" },
      },
      take: 10,
      orderBy: { createdAt: "asc" },
      select: {
        id: true, startDate: true, endDate: true, days: true,
        employee: { select: { id: true, firstName: true, lastName: true } },
        type: { select: { name: true } },
      },
    });
    dashboard.pendingApprovals = pending;
  } else if (hasPermission(ctx.permissions, "leave.viewAll")) {
    const pending = await db.leaveRequest.findMany({
      where: { status: "PENDING" },
      take: 10,
      orderBy: { createdAt: "asc" },
      select: {
        id: true, startDate: true, endDate: true, days: true,
        employee: { select: { id: true, firstName: true, lastName: true } },
        type: { select: { name: true } },
      },
    });
    dashboard.pendingApprovals = pending;
  }

  if (hasPermission(ctx.permissions, "employee.view")) {
    const [total, active, newHires, onLeave] = await Promise.all([
      db.employee.count({ where: {} }),
      db.employee.count({ where: { status: { category: "ACTIVE" }, terminationDate: null } }),
      db.employee.count({ where: { startDate: { gte: new Date(now.getTime() - 30 * 864e5) } } }),
      db.employee.count({ where: { status: { category: "ON_LEAVE" } } }),
    ]);
    Object.assign(dashboard, { people: { total, active, newHires30d: newHires, onLeaveToday: onLeave } });
  }

  if (hasPermission(ctx.permissions, "report.view")) {
    const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const starters = await db.employee.findMany({
      where: { startDate: { gte: sixMonthsAgo } },
      select: { startDate: true },
    });
    const buckets = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      buckets.set(d.toISOString().slice(0, 7), 0);
    }
    for (const e of starters) {
      const key = e.startDate.toISOString().slice(0, 7);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const departures = await db.employee.count({
      where: { terminationDate: { gte: sixMonthsAgo } },
    });
    const byDepartment = await db.employee.groupBy({
      by: ["departmentId"],
      where: { terminationDate: null },
      _count: true,
    });
    const deptIds = byDepartment.map((d) => d.departmentId).filter((x): x is string => Boolean(x));
    const departments = deptIds.length
      ? await db.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, name: true } })
      : [];
    dashboard.workforce = {
      departures180d: departures,
      hiresByMonth: [...buckets.entries()].map(([month, count]) => ({ month, count })),
      departments: byDepartment.map((row) => ({
        departmentId: row.departmentId,
        name: departments.find((d) => d.id === row.departmentId)?.name ?? null,
        count: row._count,
      })),
    };
  }

  if (hasPermission(ctx.permissions, "document.viewAll")) {
    dashboard.expiringDocuments = await db.document.count({
      where: { expiresAt: { lte: in30, gte: now }, archivedAt: null },
    });
  }

  if (hasPermission(ctx.permissions, "recruitment.manage")) {
    const applications = await db.application.groupBy({ by: ["stage"], _count: true });
    dashboard.recruitmentPipeline = applications.map((a) => ({ stage: a.stage, count: a._count }));
  }

  return dashboard;
}
