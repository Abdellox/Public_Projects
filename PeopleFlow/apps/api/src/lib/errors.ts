import type { Prisma } from "@prisma/client";
import type { ScopedDb } from "@peopleflow/database";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (msg: string, details?: unknown) =>
  new ApiError(400, "BAD_REQUEST", msg, details);

export const unauthorized = (msg = "Authentication required") =>
  new ApiError(401, "UNAUTHORIZED", msg);

export const forbidden = (msg = "You do not have permission to perform this action") =>
  new ApiError(403, "FORBIDDEN", msg);

export const notFound = (msg = "Resource not found") =>
  new ApiError(404, "NOT_FOUND", msg);

export const conflict = (msg: string, details?: unknown) =>
  new ApiError(409, "CONFLICT", msg, details);

export function requirePermission(
  permissions: ReadonlySet<string>,
  key: string,
): void {
  if (!permissions.has("*") && !permissions.has(key)) {
    throw forbidden(`Missing required permission: ${key}`);
  }
}

/** Walk the manager chain from an employee upwards to see if `managerId` is above them. */
export async function isManagerOf(
  db: ScopedDb | Prisma.TransactionClient,
  managerId: string,
  employeeId: string,
): Promise<boolean> {
  let currentId: string | null = employeeId;
  for (let depth = 0; depth < 12 && currentId; depth++) {
    const employee: { managerId: string | null } | null =
      await db.employee.findUnique({
        where: { id: currentId },
        select: { managerId: true },
      });
    if (!employee) return false;
    if (employee.managerId === managerId) return true;
    currentId = employee.managerId;
  }
  return false;
}

export async function getEmployeeForUser(db: DbLike, userId: string) {
  return db.employee.findFirst({ where: { userId }, select: { id: true, managerId: true } });
}

type DbLike = Pick<ScopedDb, "employee">;

export function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
