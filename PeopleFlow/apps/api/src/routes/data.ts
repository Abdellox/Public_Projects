import type { FastifyInstance } from "fastify";
import { hasPermission } from "@peopleflow/auth";
import { importPreviewSchema, importCommitSchema } from "@peopleflow/validation";
import { badRequest, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { parseCsvWithHeaders, toCsv } from "../lib/csv.js";
import { audit } from "../services/audit.js";
import { clientIp } from "../lib/cookies.js";
import { prisma } from "@peopleflow/database";

const EMPLOYEE_CSV_HEADERS = [
  "firstName", "lastName", "email", "employmentType", "startDate",
  "phone", "employeeNumber", "department", "jobTitle",
];

export async function dataRoutes(app: FastifyInstance): Promise<void> {
  // ── Export ─────────────────────────────────────────────────────────────────
  app.get("/data/export/:entity", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "data.export");
    const { entity } = request.params as { entity: string };
    if (entity !== "employees") throw badRequest("Unsupported export entity");

    const rows = await ctx.db.employee.findMany({
      orderBy: { employeeNumber: "asc" },
      include: {
        department: { select: { name: true } },
        jobTitle: { select: { name: true } },
        status: { select: { name: true } },
      },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "data.exported",
      metadata: { entity, rows: rows.length },
      ip: clientIp(request),
    });

    const csv = toCsv(
      [...EMPLOYEE_CSV_HEADERS, "status"],
      rows.map((e) => [
        e.firstName, e.lastName, e.email, e.employmentType,
        e.startDate.toISOString().slice(0, 10),
        e.phone, e.employeeNumber, e.department?.name ?? "", e.jobTitle?.name ?? "", e.status.name,
      ]),
    );
    return reply
      .header("content-type", "text/csv; charset=utf-8")
      .header("content-disposition", `attachment; filename="employees-${new Date().toISOString().slice(0, 10)}.csv"`)
      .send(csv);
  });

  // ── Import preview (validate + detect duplicates) ──────────────────────────
  app.post("/data/import/preview", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "data.import");
    const input = importPreviewSchema.parse(request.body);
    if (input.entity !== "EMPLOYEE") throw badRequest("Unsupported import entity");

    const report = await buildImportReport(ctx.organizationId, input.rows, input.mapping as Record<string, string>);
    return report;
  });

  app.post("/data/import/commit", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "data.import");
    const input = importCommitSchema.parse(request.body);

    const report = await buildImportReport(ctx.organizationId, input.rows, input.mapping as Record<string, string>);
    if (report.errors.length > 0) {
      throw badRequest("Import contains validation errors. Fix them and re-run the preview.", report);
    }

    const defaultStatus = await ctx.db.employeeStatusDef.findFirst({ where: { isDefault: true } });
    if (!defaultStatus) throw badRequest("Organization has no default employment status");

    let imported = 0;
    await prisma.$transaction(async () => {
      for (const row of report.validRows) {
        if (row.existingEmployeeId) {
          if (input.mode === "upsert") {
            await ctx.db.employee.update({
              where: { id: row.existingEmployeeId },
              data: {
                firstName: row.data.firstName,
                lastName: row.data.lastName,
                phone: row.data.phone || null,
              },
            });
            imported++;
          }
          continue;
        }
        await ctx.db.employee.create({
          data: {
            organizationId: ctx.organizationId,
            firstName: row.data.firstName,
            lastName: row.data.lastName,
            email: row.data.email,
            employmentType: row.data.employmentType,
            startDate: new Date(`${row.data.startDate}T00:00:00.000Z`),
            phone: row.data.phone || null,
            statusId: defaultStatus.id,
            employeeNumber: row.data.employeeNumber || `IMP-${Date.now().toString(36).toUpperCase()}-${imported}`,
          },
        });
        imported++;
      }
    });

    const job = await ctx.db.importJob.create({
      data: {
        organizationId: ctx.organizationId,
        entity: "EMPLOYEE",
        status: "COMPLETED",
        createdById: ctx.userId,
        report: { imported, duplicatesSkipped: report.duplicates.length } as never,
      },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "data.imported",
      entityType: "ImportJob",
      entityId: job.id,
      metadata: { imported },
      ip: clientIp(request),
    });

    return reply.code(201).send({ imported, jobId: job.id });
  });
}

type ImportRow = {
  rowNumber: number;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "FREELANCER";
    startDate: string;
    phone?: string;
    employeeNumber?: string;
  };
  existingEmployeeId: string | null;
};

async function buildImportReport(
  organizationId: string,
  rawRows: Record<string, unknown>[],
  mapping: Record<string, string>,
) {
  const errors: { row: number; field?: string; message: string }[] = [];
  const validRows: ImportRow[] = [];
  const seenEmails = new Set<string>();

  const db = prisma;
  const orgEmployees = await db.employee.findMany({
    where: { organizationId },
    select: { id: true, email: true },
  });
  const existingByEmail = new Map(orgEmployees.map((e) => [e.email.toLowerCase(), e.id]));

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const get = (field: keyof typeof mapping): string => {
      const sourceColumn = mapping[field];
      const value = sourceColumn ? raw[sourceColumn] : undefined;
      return value == null ? "" : String(value).trim();
    };

    const rowNumber = i + 2;
    const firstName = get("firstName");
    const lastName = get("lastName");
    const email = get("email").toLowerCase();
    const employmentTypeRaw = get("employmentType").toUpperCase().replace("-", "_") || "FULL_TIME";
    const employmentType = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "FREELANCER"].includes(employmentTypeRaw)
      ? (employmentTypeRaw as ImportRow["data"]["employmentType"])
      : null;
    const startDate = /^\d{4}-\d{2}-\d{2}$/.test(get("startDate")) ? get("startDate") : null;
    const phone = get("phone");
    const employeeNumber = get("employeeNumber");

    if (!firstName) errors.push({ row: rowNumber, field: "firstName", message: "First name is required" });
    if (!lastName) errors.push({ row: rowNumber, field: "lastName", message: "Last name is required" });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.push({ row: rowNumber, field: "email", message: "Valid email is required" });
    }
    if (!employmentType) {
      errors.push({ row: rowNumber, field: "employmentType", message: `Unknown employment type "${employmentTypeRaw}"` });
    }
    if (!startDate) {
      errors.push({ row: rowNumber, field: "startDate", message: "Start date must be yyyy-mm-dd" });
    }
    if (seenEmails.has(email)) {
      errors.push({ row: rowNumber, field: "email", message: "Duplicate email within file" });
    }

    if (errors.every((e) => e.row !== rowNumber)) {
      seenEmails.add(email);
      validRows.push({
        rowNumber,
        existingEmployeeId: existingByEmail.get(email) ?? null,
        data: {
          firstName, lastName, email,
          employmentType: employmentType!,
          startDate: startDate!,
          ...(phone ? { phone } : {}),
          ...(employeeNumber ? { employeeNumber } : {}),
        },
      });
    }
  }

  const duplicates = validRows.filter((r) => r.existingEmployeeId);

  return {
    totalRows: rawRows.length,
    validCount: validRows.length,
    duplicateCount: duplicates.length,
    errors,
    duplicates: duplicates.map((d) => ({ row: d.rowNumber, email: d.data.email })),
    validRows,
  };
}

export async function csvUploadRoutes(app: FastifyInstance): Promise<void> {
  app.post("/data/import/parse", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, hasWildcard(ctx.permissions) ? "*" : "data.import");
    const body = request.body as { csv?: string };
    if (!body.csv) throw badRequest("Field 'csv' with raw CSV content required");
    const parsed = parseCsvWithHeaders(body.csv.slice(0, 5_000_000));
    return parsed;
  });

  app.get("/data/import/template.csv", async (_request, reply) => {
    return reply
      .header("content-type", "text/csv; charset=utf-8")
      .send(toCsv(EMPLOYEE_CSV_HEADERS, [["Jane", "Doe", "jane@example.com", "FULL_TIME", "2024-01-15", "+49...", "", "Engineering"]]));
  });
}

function hasWildcard(perms: ReadonlySet<string>): boolean {
  return perms.has("*");
}
