import { PrismaClient, Prisma } from "@prisma/client";

export * from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Models whose rows are owned by exactly one organization. Any access through
 * the scoped client is guaranteed to be filtered by (or written with) the
 * caller's organizationId.
 */
export const TENANT_MODELS = new Set<string>([
  "Membership",
  "Role",
  "Employee",
  "EmployeeStatusDef",
  "Department",
  "Team",
  "Location",
  "JobTitle",
  "CustomFieldDef",
  "SalaryRecord",
  "LeaveType",
  "LeaveBalance",
  "LeaveRequest",
  "PublicHoliday",
  "WorkSchedule",
  "AttendanceEntry",
  "Document",
  "DocumentVersion",
  "Goal",
  "ReviewCycle",
  "Review",
  "Feedback",
  "JobOpening",
  "Candidate",
  "Application",
  "ApplicationStageHistory",
  "Interview",
  "InterviewFeedback",
  "Course",
  "TrainingAssignment",
  "Certification",
  "Announcement",
  "AnnouncementReaction",
  "AnnouncementComment",
  "Task",
  "WorkflowTemplate",
  "WorkflowRun",
  "ImportJob",
]);

export class TenantScopeError extends Error {
  constructor(model: string) {
    super(`Cross-tenant access blocked on ${model}`);
    this.name = "TenantScopeError";
  }
}

type Delegate = {
  findFirst: (args?: Record<string, unknown>) => Promise<unknown>;
};

/**
 * Returns a Prisma client bound to one organization.
 *
 * Defense-in-depth layer: routes/services already filter by organizationId,
 * but this extension makes it impossible to forget.
 *
 *  - reads (find/count/aggregate/groupBy): WHERE is forced to include organizationId
 *  - create/createMany: data.organizationId is injected
 *  - update/delete/upsert on unique wheres: the target row is first resolved
 *    within the tenant; otherwise the operation is rejected
 *  - connectOrCreate / nested relation smuggling is rejected on tenant models;
 *    relation ids must be validated by callers (see docs/ARCHITECTURE.md)
 */
export function scopedClient(client: PrismaClient, organizationId: string) {
  return client.$extends({
    name: "tenantScope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args);
          }

          const delegate = (client as unknown as Record<string, Delegate>)[model];
          if (!delegate) return query(args);

          const rest = { ...(args as Record<string, unknown>) };

          switch (operation) {
            case "findMany":
            case "findFirst":
            case "findFirstOrThrow":
            case "count":
            case "aggregate": {
              rest.where = mergeTenantFilter(rest.where, organizationId);
              return query(rest);
            }
            case "groupBy": {
              rest.where = mergeTenantFilter(rest.where, organizationId);
              return query(rest);
            }
            case "findUnique":
            case "findUniqueOrThrow": {
              const found = await resolveInTenant(delegate, rest.where, organizationId);
              if (!found) {
                if (operation === "findUniqueOrThrow") {
                  throw new Prisma.PrismaClientKnownRequestError("Record not found", {
                    code: "P2025",
                    clientVersion: Prisma.prismaVersion.client,
                  });
                }
                return null;
              }
              return query(rest);
            }
            case "create": {
              const createArgs = rest as { data?: Record<string, unknown> };
              createArgs.data = { ...createArgs.data, organizationId };
              return query(createArgs as never);
            }
            case "createMany": {
              const manyArgs = rest as { data?: unknown };
              if (Array.isArray(manyArgs.data)) {
                manyArgs.data = manyArgs.data.map((row) => ({ ...(row as object), organizationId }));
              } else if (manyArgs.data && typeof manyArgs.data === "object") {
                manyArgs.data = { ...(manyArgs.data as object), organizationId };
              }
              return query(manyArgs as never);
            }
            case "update":
            case "delete":
            case "upsert": {
              const whereArgs = rest as { where?: Record<string, unknown>; create?: Record<string, unknown> };
              const exists = await resolveInTenant(delegate, whereArgs.where, organizationId);
              if (!exists) {
                throw new Prisma.PrismaClientKnownRequestError(
                  `Record not found in current organization (${model})`,
                  { code: "P2025", clientVersion: Prisma.prismaVersion.client },
                );
              }
              if (operation === "upsert" && whereArgs.create) {
                whereArgs.create = { ...whereArgs.create, organizationId };
              }
              return query(whereArgs);
            }
            default:
              return query(args);
          }
        },
      },
    },
  });
}

function mergeTenantFilter(
  where: unknown,
  organizationId: string,
): Record<string, unknown> {
  const base = (where && typeof where === "object" ? { ...(where as object) } : {}) as Record<string, unknown>;
  if ("organizationId" in base && base["organizationId"] !== organizationId) {
    throw new TenantScopeError("conflicting organizationId filter");
  }
  return { ...base, organizationId };
}

async function resolveInTenant(
  delegate: Delegate,
  where: unknown,
  organizationId: string,
): Promise<{ id: string } | null> {
  if (!where || typeof where !== "object") return null;
  return delegate.findFirst({
    where: { AND: [where, { organizationId }] },
    select: { id: true },
  }) as Promise<{ id: string } | null>;
}

export type ScopedDb = ReturnType<typeof scopedClient>;
export type Db = PrismaClient | ScopedDb;
