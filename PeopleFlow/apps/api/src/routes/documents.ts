import type { FastifyInstance } from "fastify";
import { hasPermission } from "@peopleflow/auth";
import type { DocumentVisibility } from "@prisma/client";
import { badRequest, forbidden, notFound, requirePermission } from "../lib/errors.js";
import { meta, pageQuery, skipTake } from "../lib/pagination.js";
import { requireCtx, type RequestContext } from "../context.js";
import { audit } from "../services/audit.js";
import { clientIp } from "../lib/cookies.js";
import { openStored, readMultipartFileBuffer, storeUpload, type StoredFileMeta } from "../lib/files.js";

export async function documentRoutes(app: FastifyInstance): Promise<void> {
  app.get("/documents", async (request) => {
    const ctx = requireCtx(request);
    const query = pageQuery.parse(request.query);
    const employeeId = (request.query as { employeeId?: string }).employeeId;

    const isHr = hasPermission(ctx.permissions, "document.viewAll");
    let where: Record<string, unknown>;

    if (isHr) {
      where = { archivedAt: null, ...(employeeId ? { employeeId } : {}) };
    } else {
      const visibleToMe: Record<string, unknown>[] = [
        { visibility: "COMPANY" },
        { uploaderUserId: ctx.userId },
      ];
      if (ctx.employeeId) {
        visibleToMe.push({ employeeId: ctx.employeeId });
        if (hasPermission(ctx.permissions, "leave.approve")) {
          visibleToMe.push({ visibility: "MANAGERS", employee: { managerId: ctx.employeeId } });
        }
      }
      const clauses: Record<string, unknown>[] = [{ OR: visibleToMe }];
      if (employeeId) clauses.push({ employeeId });
      where = { archivedAt: null, AND: clauses };
    }

    const [total, rows] = await Promise.all([
      ctx.db.document.count({ where: where as never }),
      ctx.db.document.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        ...skipTake(query),
        select: {
          id: true, title: true, category: true, visibility: true, currentVersion: true,
          fileName: true, fileSize: true, mimeType: true, expiresAt: true, createdAt: true,
          employee: { select: { id: true, firstName: true, lastName: true } },
          uploaderUser: { select: { name: true } },
        },
      }),
    ]);
    return { data: rows, meta: meta(total, query) };
  });

  app.post("/documents", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "document.upload");

    const file = await request.file();
    if (!file) throw badRequest("Multipart file upload expected");
    let payload: { buffer: Buffer; meta: StoredFileMeta };
    try {
      payload = await readMultipartFileBuffer(file);
    } catch (e) {
      throw e instanceof Error && e.message === "FILE_TOO_LARGE" ? badRequest("File exceeds the 25 MB limit") : e;
    }

    const fields = file.fields as Record<string, { value?: string }>;
    const title = fields["title"]?.value?.trim();
    if (!title) throw badRequest("Field 'title' is required");
    const category = fields["category"]?.value ?? "other";
    const visibility = (fields["visibility"]?.value ?? "PRIVATE") as DocumentVisibility;
    if (!["PRIVATE", "HR_ONLY", "MANAGERS", "COMPANY"].includes(visibility)) {
      throw badRequest("Invalid visibility");
    }
    if (visibility === "HR_ONLY") {
      requirePermission(ctx.permissions, "document.viewAll");
    }
    const employeeId = fields["employeeId"]?.value || undefined;
    const expiresAtRaw = fields["expiresAt"]?.value || null;
    const expiresAt = expiresAtRaw ? new Date(`${expiresAtRaw}T00:00:00.000Z`) : null;

    if (employeeId) {
      const employee = await ctx.db.employee.findFirst({ where: { id: employeeId }, select: { id: true } });
      if (!employee) throw badRequest("Employee not found in this organization");
    }

    const fileKey = await storeUpload(app.pfEnv, payload.meta, payload.buffer);

    const document = await ctx.db.document.create({
      data: {
        organizationId: ctx.organizationId,
        title,
        category,
        visibility,
        employeeId: employeeId ?? null,
        uploaderUserId: ctx.userId,
        expiresAt,
        fileKey,
        fileName: payload.meta.fileName,
        fileSize: payload.meta.size,
        mimeType: payload.meta.mimeType,
      },
    });
    await ctx.db.documentVersion.create({
      data: {
        organizationId: ctx.organizationId,
        documentId: document.id,
        version: 1,
        fileKey,
        fileName: payload.meta.fileName,
        fileSize: payload.meta.size,
        mimeType: payload.meta.mimeType,
        uploadedById: ctx.userId,
      },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "document.uploaded",
      entityType: "Document",
      entityId: document.id,
      metadata: { title, category, visibility },
      ip: clientIp(request),
    });

    return reply.code(201).send({ id: document.id, title: document.title, version: document.currentVersion });
  });

  app.post("/documents/:id/versions", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "document.upload");
    const { id } = request.params as { id: string };

    const document = await ctx.db.document.findFirst({
      where: { id },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    if (!document) throw notFound();

    const canEdit =
      document.uploaderUserId === ctx.userId ||
      hasPermission(ctx.permissions, "document.manage");
    if (!canEdit) throw forbidden();

    const file = await request.file();
    if (!file) throw badRequest("Multipart file upload expected");
    const payload = await readMultipartFileBuffer(file);
    const fileKey = await storeUpload(app.pfEnv, payload.meta, payload.buffer);
    const nextVersion = document.currentVersion + 1;

    await ctx.db.documentVersion.create({
      data: {
        organizationId: ctx.organizationId,
        documentId: document.id,
        version: nextVersion,
        fileKey,
        fileName: payload.meta.fileName,
        fileSize: payload.meta.size,
        mimeType: payload.meta.mimeType,
        uploadedById: ctx.userId,
      },
    });
    await ctx.db.document.update({
      where: { id: document.id },
      data: {
        currentVersion: nextVersion,
        fileKey,
        fileName: payload.meta.fileName,
        fileSize: payload.meta.size,
        mimeType: payload.meta.mimeType,
      },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "document.new_version",
      entityType: "Document",
      entityId: document.id,
      metadata: { version: nextVersion },
      ip: clientIp(request),
    });

    return reply.code(201).send({ id: document.id, version: nextVersion });
  });

  app.get("/documents/:id/download", async (request, reply) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const versionParam = (request.query as { version?: string }).version;

    const document = await ctx.db.document.findFirst({
      where: { id },
      include: { versions: { orderBy: { version: "desc" } } },
    });
    if (!document || document.archivedAt) throw notFound();

    const allowed = await canDownload(ctx, document);
    if (!allowed) throw forbidden();

    const version = versionParam
      ? document.versions.find((v) => v.version === Number(versionParam))
      : document.versions[0];
    if (!version) throw badRequest("Unknown document version");

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "document.downloaded",
      entityType: "Document",
      entityId: document.id,
      metadata: { version: version.version },
      ip: clientIp(request),
    });

    const storage = openStored(app.pfEnv, version.fileKey, {
      fileName: version.fileName,
      mimeType: version.mimeType,
      size: version.fileSize,
    });
    const stream = await storage.openStream();
    return reply
      .header("content-type", version.mimeType)
      .header("content-length", version.fileSize)
      .header("content-disposition", `attachment; filename="${encodeURIComponent(version.fileName)}"`)
      .header("cache-control", "private, no-store")
      .send(stream);
  });

  app.delete("/documents/:id", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const document = await ctx.db.document.findFirst({ where: { id } });
    if (!document) throw notFound();
    const canDelete =
      document.uploaderUserId === ctx.userId || hasPermission(ctx.permissions, "document.manage");
    if (!canDelete) throw forbidden();

    await ctx.db.document.update({
      where: { id: document.id },
      data: { archivedAt: new Date() },
    });

    await audit({
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      actorName: ctx.name,
      action: "document.archived",
      entityType: "Document",
      entityId: document.id,
      ip: clientIp(request),
    });
    return { ok: true };
  });

  async function canDownload(
    ctx: RequestContext,
    document: { visibility: DocumentVisibility; employeeId: string | null; uploaderUserId: string | null },
  ): Promise<boolean> {
    if (document.visibility === "COMPANY") return true;
    if (document.visibility === "HR_ONLY") {
      return hasPermission(ctx.permissions, "document.viewAll");
    }
    if (document.uploaderUserId === ctx.userId) return true;
    if (document.employeeId === ctx.employeeId) return true;
    if (
      document.visibility === "MANAGERS" &&
      document.employeeId &&
      ctx.employeeId &&
      hasPermission(ctx.permissions, "leave.approve")
    ) {
      const target = await ctx.db.employee.findFirst({
        where: { id: document.employeeId, managerId: ctx.employeeId },
        select: { id: true },
      });
      if (target) return true;
    }
    return hasPermission(ctx.permissions, "document.viewAll");
  }

}
