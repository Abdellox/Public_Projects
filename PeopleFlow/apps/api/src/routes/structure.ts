import type { FastifyInstance } from "fastify";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createTeamSchema,
  updateTeamSchema,
  createLocationSchema,
  updateLocationSchema,
  createJobTitleSchema,
  createStatusSchema,
  updateStatusSchema,
  upsertCustomFieldSchema,
} from "@peopleflow/validation";
import { badRequest, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { audit } from "../services/audit.js";
import { clientIp } from "../lib/cookies.js";

export async function structureRoutes(app: FastifyInstance): Promise<void> {
  const ctxOf = requireCtx;

  // ── Departments ────────────────────────────────────────────────────────────
  app.get("/departments", async (request) => {
    const ctx = ctxOf(request);
    const rows = await ctx.db.department.findMany({
      orderBy: { name: "asc" },
      include: {
        parent: { select: { id: true, name: true } },
        managerEmployee: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { employees: true, teams: true } },
      },
    });
    return { data: rows };
  });

  app.post("/departments", async (request, reply) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = createDepartmentSchema.parse(request.body);
    if (input.parentId) {
      const parent = await ctx.db.department.findUnique({ where: { id: input.parentId } });
      if (!parent) throw badRequest("Parent department not found");
    }
    if (input.managerEmployeeId) {
      const mgr = await ctx.db.employee.findUnique({ where: { id: input.managerEmployeeId } });
      if (!mgr) throw badRequest("Manager employee not found");
    }
    const row = await ctx.db.department.create({
      data: {
        organizationId: ctx.organizationId,
        name: input.name,
        description: input.description ?? null,
        parentId: input.parentId ?? null,
        managerEmployeeId: input.managerEmployeeId ?? null,
      },
    });
    return reply.code(201).send(row);
  });

  app.patch("/departments/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const input = updateDepartmentSchema.parse(request.body);
    const existing = await ctx.db.department.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    const row = await ctx.db.department.update({
      where: { id: existing.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId ?? null } : {}),
        ...(input.managerEmployeeId !== undefined
          ? { managerEmployeeId: input.managerEmployeeId ?? null }
          : {}),
      },
    });
    return row;
  });

  app.delete("/departments/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const existing = await ctx.db.department.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    await ctx.db.department.delete({ where: { id: existing.id } });
    return { ok: true };
  });

  // ── Teams ──────────────────────────────────────────────────────────────────
  app.get("/teams", async (request) => {
    const ctx = ctxOf(request);
    const rows = await ctx.db.team.findMany({
      orderBy: { name: "asc" },
      include: {
        department: { select: { id: true, name: true } },
        leadEmployee: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { employees: true } },
      },
    });
    return { data: rows };
  });

  app.post("/teams", async (request, reply) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = createTeamSchema.parse(request.body);
    if (input.departmentId) {
      const dept = await ctx.db.department.findUnique({ where: { id: input.departmentId } });
      if (!dept) throw badRequest("Department not found");
    }
    if (input.leadEmployeeId) {
      const lead = await ctx.db.employee.findUnique({ where: { id: input.leadEmployeeId } });
      if (!lead) throw badRequest("Team lead not found");
    }
    const row = await ctx.db.team.create({
      data: {
        organizationId: ctx.organizationId,
        name: input.name,
        description: input.description ?? null,
        departmentId: input.departmentId ?? null,
        leadEmployeeId: input.leadEmployeeId ?? null,
      },
    });
    return reply.code(201).send(row);
  });

  app.patch("/teams/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const input = updateTeamSchema.parse(request.body);
    const existing = await ctx.db.team.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    return ctx.db.team.update({
      where: { id: existing.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.departmentId !== undefined ? { departmentId: input.departmentId ?? null } : {}),
        ...(input.leadEmployeeId !== undefined ? { leadEmployeeId: input.leadEmployeeId ?? null } : {}),
      },
    });
  });

  app.delete("/teams/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const existing = await ctx.db.team.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    await ctx.db.team.delete({ where: { id: existing.id } });
    return { ok: true };
  });

  // ── Locations ──────────────────────────────────────────────────────────────
  app.get("/locations", async (request) => {
    const ctx = ctxOf(request);
    return { data: await ctx.db.location.findMany({ orderBy: { name: "asc" } }) };
  });

  app.post("/locations", async (request, reply) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = createLocationSchema.parse(request.body);
    const row = await ctx.db.location.create({ data: { ...input, organizationId: ctx.organizationId } });
    return reply.code(201).send(row);
  });

  app.patch("/locations/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const input = updateLocationSchema.parse(request.body);
    const existing = await ctx.db.location.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    return ctx.db.location.update({
      where: { id: existing.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.address !== undefined ? { address: input.address ?? null } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone ?? null } : {}),
      },
    });
  });

  app.delete("/locations/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const existing = await ctx.db.location.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    await ctx.db.location.delete({ where: { id: existing.id } });
    return { ok: true };
  });

  // ── Job titles ─────────────────────────────────────────────────────────────
  app.get("/job-titles", async (request) => {
    const ctx = ctxOf(request);
    return { data: await ctx.db.jobTitle.findMany({ orderBy: { name: "asc" } }) };
  });

  app.post("/job-titles", async (request, reply) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = createJobTitleSchema.parse(request.body);
    const row = await ctx.db.jobTitle.create({ data: { name: input.name, organizationId: ctx.organizationId } });
    return reply.code(201).send(row);
  });

  app.delete("/job-titles/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const existing = await ctx.db.jobTitle.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    await ctx.db.jobTitle.delete({ where: { id: existing.id } });
    return { ok: true };
  });

  // ── Employment statuses ────────────────────────────────────────────────────
  app.get("/employment-statuses", async (request) => {
    const ctx = ctxOf(request);
    return { data: await ctx.db.employeeStatusDef.findMany({ orderBy: { name: "asc" } }) };
  });

  app.post("/employment-statuses", async (request, reply) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const input = createStatusSchema.parse(request.body);
    const row = await ctx.db.employeeStatusDef.create({ data: { ...input, organizationId: ctx.organizationId } });
    return reply.code(201).send(row);
  });

  app.patch("/employment-statuses/:id", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { id } = request.params as { id: string };
    const input = updateStatusSchema.parse(request.body);
    const existing = await ctx.db.employeeStatusDef.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    return ctx.db.employeeStatusDef.update({ where: { id: existing.id }, data: input });
  });

  // ── Custom fields ──────────────────────────────────────────────────────────
  app.get("/custom-fields", async (request) => {
    const ctx = ctxOf(request);
    return { data: await ctx.db.customFieldDef.findMany({ orderBy: { key: "asc" } }) };
  });

  app.put("/custom-fields/:key", async (request, reply) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { key } = request.params as { key: string };
    const input = upsertCustomFieldSchema.parse(request.body);
    const row = await ctx.db.customFieldDef.upsert({
      where: { organizationId_entity_key: { organizationId: ctx.organizationId, entity: input.entity, key } },
      create: {
        organizationId: ctx.organizationId,
        entity: input.entity,
        key,
        label: input.label,
        type: input.type,
        options: input.options ?? [],
        required: input.required,
      },
      update: {
        label: input.label,
        type: input.type,
        options: input.options ?? [],
        required: input.required,
      },
    });
    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "custom_field.upserted",
      entityType: "CustomFieldDef",
      entityId: row.id,
      ip: clientIp(request),
    });
    return reply.code(201).send(row);
  });

  app.delete("/custom-fields/:key", async (request) => {
    const ctx = ctxOf(request);
    requirePermission(ctx.permissions, "org.settings");
    const { key } = request.params as { key: string };
    await ctx.db.customFieldDef.deleteMany({ where: { key } });
    return { ok: true };
  });
}
