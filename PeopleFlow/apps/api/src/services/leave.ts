import type { LeaveRequest, Prisma } from "@prisma/client";
import { conflict } from "../lib/errors.js";
import type { ScopedDb } from "@peopleflow/database";

export function workingDaysBetween(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
  if (days <= 0) return 0;
  let count = 0;
  const cursor = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

export async function assertNoOverlap(
  db: ScopedDb,
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
): Promise<void> {
  const overlap = await db.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ["PENDING", "APPROVED"] },
      NOT: excludeId ? { id: excludeId } : undefined,
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: { id: true, startDate: true, endDate: true },
  });
  if (overlap) {
    throw conflict("The requested period overlaps an existing leave request", {
      overlappingRequestId: overlap.id,
      existingStart: overlap.startDate,
      existingEnd: overlap.endDate,
    });
  }
}

export async function adjustBalancesOnCreate(
  db: Prisma.TransactionClient | ScopedDb,
  request: { organizationId: string; employeeId: string; leaveTypeId: string; startDate: Date; days: number },
): Promise<void> {
  const year = request.startDate.getUTCFullYear();
  await db.leaveBalance.upsert({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
        year,
      },
    },
    create: {
      organizationId: request.organizationId,
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
      year,
      entitled: 0,
      pending: request.days,
    },
    update: { pending: { increment: request.days } },
  });
}

export async function applyDecision(
  db: Prisma.TransactionClient | ScopedDb,
  request: Pick<LeaveRequest, "employeeId" | "leaveTypeId" | "startDate" | "days" | "status">,
  decision: "APPROVED" | "REJECTED" | "CANCELLED",
): Promise<void> {
  const year = request.startDate.getUTCFullYear();
  const where = {
    employeeId_leaveTypeId_year: {
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
      year,
    },
  };

  const wasPending = request.status === "PENDING";
  const wasApproved = request.status === "APPROVED";

  if (decision === "APPROVED") {
    await db.leaveBalance.update({
      where,
      data: { pending: { decrement: request.days }, used: { increment: request.days } },
    });
    return;
  }

  if (decision === "REJECTED" && wasPending) {
    await db.leaveBalance.update({
      where,
      data: { pending: { decrement: request.days } },
    });
    return;
  }

  if (decision === "CANCELLED") {
    if (wasPending) {
      await db.leaveBalance.update({
        where,
        data: { pending: { decrement: request.days } },
      });
    } else if (wasApproved) {
      await db.leaveBalance.updateMany({
        where: {
          employeeId: request.employeeId,
          leaveTypeId: request.leaveTypeId,
          year,
          used: { gte: request.days },
        },
        data: { used: { decrement: request.days } },
      });
    }
  }
}
