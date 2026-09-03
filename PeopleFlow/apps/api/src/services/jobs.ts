import type { FastifyInstance } from "fastify";
import { prisma } from "@peopleflow/database";

/**
 * Lightweight in-process background scheduler.
 *
 * Deliberately dependency-free for the MVP: jobs run on an interval inside the
 * API process. For horizontal scaling, swap this module for a Redis/BullMQ
 * worker (see docs/ARCHITECTURE.md) — call sites stay identical.
 */
export function startBackgroundJobs(app: FastifyInstance): () => void {
  const intervalMs = 5 * 60 * 1000;

  async function ensureCurrentYearBalances(): Promise<void> {
    const year = new Date().getUTCFullYear();
    const orgs = await prisma.organization.findMany({ select: { id: true } });
    for (const org of orgs) {
      const [employees, leaveTypes] = await Promise.all([
        prisma.employee.findMany({
          where: { organizationId: org.id, terminationDate: null },
          select: { id: true },
        }),
        prisma.leaveType.findMany({
          where: { organizationId: org.id, archivedAt: null },
          select: { id: true, annualAllowanceDays: true, carryOverMaxDays: true },
        }),
      ]);
      for (const employee of employees) {
        for (const type of leaveTypes) {
          const previousYear = year - 1;
          const prev = await prisma.leaveBalance.findUnique({
            where: {
              employeeId_leaveTypeId_year: {
                employeeId: employee.id,
                leaveTypeId: type.id,
                year: previousYear,
              },
            },
            select: { entitled: true, carriedOver: true, used: true, pending: true },
          });
          const unused = prev
            ? Math.max(0, prev.entitled + prev.carriedOver - prev.used - prev.pending)
            : 0;
          const carriedOver = Math.min(unused, type.carryOverMaxDays);
          await prisma.leaveBalance.upsert({
            where: {
              employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: type.id, year },
            },
            create: {
              organizationId: org.id,
              employeeId: employee.id,
              leaveTypeId: type.id,
              year,
              entitled: type.annualAllowanceDays,
              carriedOver,
            },
            update: {},
          });
        }
      }
    }
  }

  async function notifyExpiringDocuments(): Promise<void> {
    const soon = new Date(Date.now() + 14 * 864e5);
    const docs = await prisma.document.findMany({
      where: { expiresAt: { lte: soon, gte: new Date() }, archivedAt: null },
      select: { id: true, title: true, organizationId: true, uploaderUserId: true },
    });
    for (const doc of docs) {
      if (!doc.uploaderUserId) continue;
      const existing = await prisma.notification.findFirst({
        where: { userId: doc.uploaderUserId, type: "DOCUMENT_EXPIRING", link: `/documents/${doc.id}` },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.notification.create({
        data: {
          userId: doc.uploaderUserId,
          type: "DOCUMENT_EXPIRING",
          title: `Document expiring soon: ${doc.title}`,
          link: `/documents`,
        },
      });
    }
  }

  async function remindOverdueTraining(): Promise<void> {
    const overdue = await prisma.trainingAssignment.findMany({
      where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] }, dueDate: { lt: new Date() } },
      select: { id: true, employee: { select: { userId: true } }, course: { select: { title: true } } },
      take: 200,
    });
    for (const assignment of overdue) {
      const userId = assignment.employee.userId;
      if (!userId) continue;
      const existing = await prisma.notification.findFirst({
        where: { userId, type: "TRAINING_ASSIGNED", title: { contains: assignment.course.title } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      });
      if (existing && Date.now() - existing.createdAt.getTime() < 7 * 864e5) continue;
      await prisma.notification.create({
        data: {
          userId,
          type: "TRAINING_ASSIGNED",
          title: `Overdue training: ${assignment.course.title}`,
          link: "/training",
        },
      });
    }
  }

  async function tick(): Promise<void> {
    try {
      await ensureCurrentYearBalances();
      await notifyExpiringDocuments();
      await remindOverdueTraining();
    } catch (err) {
      app.log.error({ err }, "Background job tick failed");
    }
  }

  const timer = setInterval(tick, intervalMs);
  timer.unref();

  return () => clearInterval(timer);
}
