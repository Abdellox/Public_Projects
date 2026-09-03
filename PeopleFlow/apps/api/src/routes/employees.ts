import type { FastifyInstance } from "fastify";
import type { Employee, Prisma } from "@prisma/client";
import { hasPermission } from "@peopleflow/auth";
import { createEmployeeSchema, listEmployeesQuery, updateEmployeeSchema, createSalaryRecordSchema } from "@peopleflow/validation";
import { badRequest, isManagerOf, notFound, requirePermission } from "../lib/errors.js";
import { meta, pageQuery, skipTake } from "../lib/pagination.js";
import { requireCtx } from "../context.js";
import { audit } from "../services/audit.js";
import { clientIp } from "../lib/cookies.js";

function toDate(value: string | undefined | null): Date | undefined {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

export function canViewPrivate(
  viewerEmployeeId: string | null,
  viewerPermissions: ReadonlySet<string>,
  target: Pick<Employee, "id" | "userId">,
): boolean {
  if (hasPermission(viewerPermissions, "employee.update")) return true;
  if (!viewerEmployeeId) return false;
  return target.id === viewerEmployeeId;
}

export async function hasPrivateAccess(
  db: Parameters<typeof isManagerOf>[0],
  viewerEmployeeId: string | null,
  viewerPermissions: ReadonlySet<string>,
  targetId: string,
): Promise<boolean> {
  if (hasPermission(viewerPermissions, "employee.update")) return true;
  if (!viewerEmployeeId) return false;
  if (viewerEmployeeId === targetId) return true;
  return isManagerOf(db, viewerEmployeeId, targetId);
}

export async function employeesRoutes(app: FastifyInstance): Promise<void> {
  app.get("/employees", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "employee.view");
    const query = listEmployeesQuery.parse(request.query);

    const where: Prisma.EmployeeWhereInput = {};
    if (query.q) {
      const like = { contains: query.q, mode: "insensitive" as const };
      where.OR = [
        { firstName: like },
        { lastName: like },
        { email: like },
        { employeeNumber: like },
        { skills: { has: query.q } },
      ];
    }
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.teamId) where.teamId = query.teamId;
    if (query.locationId) where.locationId = query.locationId;
    if (query.statusId) where.statusId = query.statusId;
    if (query.managerId) where.managerId = query.managerId;
    if (query.employmentType) where.employmentType = query.employmentType;

    const orderBy: Prisma.EmployeeOrderByWithRelationInput | Prisma.EmployeeOrderByWithRelationInput[] =
      query.sort === "-name"
        ? [{ lastName: "desc" }, { firstName: "desc" }]
        : query.sort === "startDate"
          ? { startDate: "asc" }
          : query.sort === "-startDate"
            ? { startDate: "desc" }
            : [{ lastName: "asc" }, { firstName: "asc" }];

    const [total, rows] = await Promise.all([
      ctx.db.employee.count({ where }),
      ctx.db.employee.findMany({
        where,
        orderBy,
        ...skipTake(query),
        select: {
          id: true, firstName: true, lastName: true, photoUrl: true, email: true,
          employeeNumber: true, employmentType: true, startDate: true, skills: true,
          department: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } },
          jobTitle: { select: { id: true, name: true } },
          status: { select: { id: true, name: true, color: true } },
          location: { select: { id: true, name: true } },
        },
      }),
    ]);

    return { data: rows, meta: meta(total, query) };
  });

  app.post("/employees", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "employee.create");
    const input = createEmployeeSchema.parse(request.body);

    const status =
      input.statusId
        ? await ctx.db.employeeStatusDef.findUnique({ where: { id: input.statusId } })
        : await ctx.db.employeeStatusDef.findFirst({ where: { isDefault: true } });
    if (!status) throw badRequest("Invalid employment status");

    await validateReferences(ctx.db, input);

    let employeeNumber = `EMP-${Date.now().toString(36).toUpperCase()}`;
    const latest = await ctx.db.employee.findFirst({
      orderBy: { createdAt: "desc" },
      select: { employeeNumber: true },
    });
    const match = latest?.employeeNumber.match(/^EMP-(\d+)$/);
    if (match) {
      employeeNumber = `EMP-${String(Number(match[1]) + 1).padStart(3, "0")}`;
    }

    const employee = await ctx.db.employee.create({
      data: {
        organizationId: ctx.organizationId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
        dateOfBirth: toDate(input.dateOfBirth) ?? null,
        address: input.address ?? null,
        jobTitleId: input.jobTitleId ?? null,
        departmentId: input.departmentId ?? null,
        teamId: input.teamId ?? null,
        managerId: input.managerId ?? null,
        locationId: input.locationId ?? null,
        employmentType: input.employmentType,
        startDate: new Date(`${input.startDate}T00:00:00.000Z`),
        statusId: status.id,
        skills: input.skills ?? [],
        emergencyContactName: input.emergencyContactName ?? null,
        emergencyContactPhone: input.emergencyContactPhone ?? null,
        customFields: (input.customFields ?? undefined) as never,
        employeeNumber,
      },
      include: EMPLOYEE_INCLUDE,
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "employee.created",
      entityType: "Employee",
      entityId: employee.id,
      ip: clientIp(request),
    });

    return reply.code(201).send(serializeEmployee(ctx, employee));
  });

  app.get("/employees/me", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "employee.view");
    if (!ctx.employeeId) {
      return { employee: null, leaveBalances: [], upcomingLeave: [], certifications: [] };
    }

    const employee = (await ctx.db.employee.findFirst({
      where: { id: ctx.employeeId },
      include: { ...EMPLOYEE_INCLUDE, manager: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
    })) as (Employee & Record<string, unknown>) | null;

    const year = new Date().getUTCFullYear();
    const [leaveBalances, upcomingLeave, certifications] = await Promise.all([
      ctx.db.leaveBalance.findMany({
        where: { employeeId: ctx.employeeId, year },
        orderBy: { leaveType: { name: "asc" } },
        select: {
          id: true, year: true, entitled: true, carriedOver: true, used: true, pending: true,
          leaveType: { select: { name: true } },
        },
      }),
      ctx.db.leaveRequest.findMany({
        where: { employeeId: ctx.employeeId, status: { in: ["PENDING", "APPROVED"] }, endDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 10,
        select: { id: true, startDate: true, endDate: true, days: true, status: true },
      }),
      ctx.db.certification.findMany({
        where: { employeeId: ctx.employeeId },
        orderBy: { issuedAt: "desc" },
        take: 20,
        include: { assignment: { select: { course: { select: { title: true } } } } },
      }),
    ]);

    return {
      employee: serializeEmployee(ctx, employee!, { privateAllowed: true }),
      leaveBalances: leaveBalances.map((b) => ({ ...b, remaining: b.entitled + b.carriedOver - b.used - b.pending })),
      upcomingLeave,
      certifications: certifications.map((c) => ({
        id: c.id,
        title: c.name,
        courseTitle: c.assignment?.course?.title ?? null,
        validTo: c.expiresAt ? c.expiresAt.toISOString() : null,
      })),
    };
  });

  app.get("/employees/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "employee.view");
    const { id } = request.params as { id: string };

    const employee = await ctx.db.employee.findFirst({
      where: { id },
      include: {
        ...EMPLOYEE_INCLUDE,
        directReports: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      },
    }) as (Employee & Record<string, unknown>) | null;

    if (!employee) throw notFound("Employee not found");

    const privateAllowed = await hasPrivateAccess(
      ctx.db,
      ctx.employeeId,
      ctx.permissions,
      employee.id,
    );
    return serializeEmployee(ctx, employee, { withReports: true, privateAllowed });
  });

  app.patch("/employees/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "employee.update");
    const { id } = request.params as { id: string };
    const input = updateEmployeeSchema.parse(request.body);

    const existing = await ctx.db.employee.findFirst({ where: { id } });
    if (!existing) throw notFound("Employee not found");

    if (input.managerId && input.managerId === id) {
      throw badRequest("An employee cannot be their own manager");
    }
    await validateReferences(ctx.db, input);

    const data: Prisma.EmployeeUpdateInput = {};
    if (input.firstName !== undefined) data.firstName = input.firstName;
    if (input.lastName !== undefined) data.lastName = input.lastName;
    if (input.email !== undefined) data.email = input.email;
    if (input.phone !== undefined) data.phone = input.phone ?? null;
    if (input.dateOfBirth !== undefined) data.dateOfBirth = toDate(input.dateOfBirth) ?? null;
    if (input.address !== undefined) data.address = input.address ?? null;
    if (input.jobTitleId !== undefined) {
      data.jobTitle = input.jobTitleId ? { connect: { id: input.jobTitleId } } : { disconnect: true };
    }
    if (input.departmentId !== undefined) {
      data.department = input.departmentId ? { connect: { id: input.departmentId } } : { disconnect: true };
    }
    if (input.teamId !== undefined) {
      data.team = input.teamId ? { connect: { id: input.teamId } } : { disconnect: true };
    }
    if (input.locationId !== undefined) {
      data.location = input.locationId ? { connect: { id: input.locationId } } : { disconnect: true };
    }
    if (input.managerId !== undefined) {
      data.manager = input.managerId ? { connect: { id: input.managerId } } : { disconnect: true };
    }
    if (input.employmentType !== undefined) data.employmentType = input.employmentType;
    if (input.startDate !== undefined) data.startDate = new Date(`${input.startDate}T00:00:00.000Z`);
    if (input.statusId !== undefined) {
      const status = await ctx.db.employeeStatusDef.findUnique({ where: { id: input.statusId } });
      if (!status) throw badRequest("Invalid employment status");
      data.status = { connect: { id: status.id } };
      if (status.category === "TERMINATED") {
        data.terminationDate = existing.terminationDate ?? new Date();
      }
    }
    if (input.skills !== undefined) data.skills = input.skills;
    if (input.emergencyContactName !== undefined) data.emergencyContactName = input.emergencyContactName ?? null;
    if (input.emergencyContactPhone !== undefined) data.emergencyContactPhone = input.emergencyContactPhone ?? null;
    if (input.customFields !== undefined) data.customFields = input.customFields as never;

    const employee = await ctx.db.employee.update({
      where: { id: existing.id },
      data,
      include: EMPLOYEE_INCLUDE,
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "employee.updated",
      entityType: "Employee",
      entityId: employee.id,
      ip: clientIp(request),
    });

    return serializeEmployee(ctx, employee);
  });

  app.delete("/employees/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "employee.delete");
    const { id } = request.params as { id: string };
    const existing = await ctx.db.employee.findFirst({ where: { id } });
    if (!existing) throw notFound("Employee not found");

    const terminated = await ctx.db.employeeStatusDef.findFirst({
      where: { category: "TERMINATED" },
    });
    if (!terminated) throw badRequest("No terminated status configured for this organization");

    const employee = await ctx.db.employee.update({
      where: { id: existing.id },
      data: {
        statusId: terminated.id,
        terminationDate: existing.terminationDate ?? new Date(),
      },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "employee.archived",
      entityType: "Employee",
      entityId: employee.id,
      ip: clientIp(request),
    });

    return { archived: true, id: employee.id };
  });

  // ── Compensation (payroll foundation) ──────────────────────────────────────

  app.get("/employees/:id/salary", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "salary.view");
    const { id } = request.params as { id: string };

    const records = await ctx.db.salaryRecord.findMany({
      where: { employeeId: id },
      orderBy: { effectiveFrom: "desc" },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "salary.viewed",
      entityType: "Employee",
      entityId: id,
      metadata: { count: records.length },
      ip: clientIp(request),
    });

    return { data: records };
  });

  app.post("/employees/:id/salary", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "salary.update");
    const { id } = request.params as { id: string };
    const input = createSalaryRecordSchema.parse({
      ...(request.body as Record<string, unknown>),
      employeeId: id,
    });

    const employee = await ctx.db.employee.findFirst({ where: { id }, select: { id: true } });
    if (!employee) throw notFound("Employee not found");

    const record = await ctx.db.salaryRecord.create({
      data: {
        organizationId: ctx.organizationId,
        employeeId: employee.id,
        type: input.type,
        currency: input.currency,
        amountMinor: input.amountMinor,
        effectiveFrom: new Date(`${input.effectiveFrom}T00:00:00.000Z`),
        note: input.note ?? null,
      },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "salary.record_created",
      entityType: "SalaryRecord",
      entityId: record.id,
      metadata: { employeeId: employee.id, type: input.type },
      ip: clientIp(request),
    });

    return reply.code(201).send(record);
  });
}

const EMPLOYEE_INCLUDE = {
  department: { select: { id: true, name: true } },
  team: { select: { id: true, name: true } },
  jobTitle: { select: { id: true, name: true } },
  location: { select: { id: true, name: true } },
  status: { select: { id: true, name: true, color: true, category: true } },
  manager: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
} as const;

async function validateReferences(db: Parameters<typeof isManagerOf>[0], input: Record<string, unknown>): Promise<void> {
  const checks: [string, () => Promise<unknown>][] = [
    ["departmentId", () => input.departmentId ? db.department.findUnique({ where: { id: String(input.departmentId) } }) : Promise.resolve(true)],
    ["teamId", () => input.teamId ? db.team.findUnique({ where: { id: String(input.teamId) } }) : Promise.resolve(true)],
    ["jobTitleId", () => input.jobTitleId ? db.jobTitle.findUnique({ where: { id: String(input.jobTitleId) } }) : Promise.resolve(true)],
    ["locationId", () => input.locationId ? db.location.findUnique({ where: { id: String(input.locationId) } }) : Promise.resolve(true)],
    ["managerId", () => input.managerId ? db.employee.findUnique({ where: { id: String(input.managerId) } }) : Promise.resolve(true)],
  ];
  for (const [field, run] of checks) {
    const found = await run();
    if (found === null) throw badRequest(`${field.replace("Id", "")} reference not found in this organization`);
  }
}

type SerializeOptions = { withReports?: boolean; privateAllowed?: boolean };

interface ViewerInfo {
  employeeId: string | null;
  permissions: ReadonlySet<string>;
}

export function serializeEmployee(
  viewer: ViewerInfo,
  employee: Employee & Record<string, unknown>,
  opts?: SerializeOptions,
): Record<string, unknown> {
  const privateAllowed =
    opts?.privateAllowed ??
    canViewPrivate(viewer.employeeId, viewer.permissions, employee as Employee);
  const base: Record<string, unknown> = {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    firstName: employee.firstName,
    lastName: employee.lastName,
    fullName: `${employee.firstName} ${employee.lastName}`,
    photoUrl: employee.photoUrl,
    email: employee.email,
    employmentType: employee.employmentType,
    startDate: employee.startDate,
    department: employee.department,
    team: employee.team,
    jobTitle: employee.jobTitle,
    location: employee.location,
    status: employee.status,
    manager: employee.manager,
    skills: employee.skills,
  };
  if (privateAllowed) {
    base.phone = employee.phone;
    base.dateOfBirth = employee.dateOfBirth;
    base.address = employee.address;
    base.emergencyContactName = employee.emergencyContactName;
    base.emergencyContactPhone = employee.emergencyContactPhone;
    base.customFields = employee.customFields;
    base.terminationDate = employee.terminationDate;
  }
  if ("directReports" in employee) base.directReports = employee.directReports;
  return base;
}
