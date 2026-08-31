import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";
import { getDb, logAudit } from "@supplyflow/database";
import { z } from "zod";
import { auditCtx, errorResponse, HttpError, jsonOk, requirePermission, type ApiContext } from "./api";

export { auditCtx, errorResponse, jsonOk, requirePermission, HttpError };
export type { ApiContext };

export interface CrudConfig {
  table: PgTable & { organizationId: PgColumn };
  entity: string;
  readPermission: Parameters<typeof requirePermission>[0];
  writePermission: Parameters<typeof requirePermission>[0];
  createSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
  searchColumns?: PgColumn[];
  orderBy?: PgColumn;
  softDelete?: boolean;
  transformCreate?: (data: z.infer<NonNullable<CrudConfig["createSchema"]>>, ctx: ApiContext) => Promise<Record<string, unknown>> | Record<string, unknown>;
}


export function makeListHandler(config: CrudConfig) {
  return async function GET(request: Request): Promise<Response> {
    try {
      const ctx = await requirePermission(config.readPermission);
      const db = getDb();
      const url = new URL(request.url);
      const q = url.searchParams.get("q")?.trim();
      const limit = Math.min(Number(url.searchParams.get("limit") ?? 200), 500);

      const conditions = [eq(config.table.organizationId as never, ctx.user.organizationId)];
      if (config.softDelete) conditions.push(isNull((config.table as unknown as { deletedAt: PgColumn }).deletedAt));
      if (q && config.searchColumns?.length) {
        conditions.push(or(...config.searchColumns.map((c) => ilike(c, `%${q}%`)))!);
      }

      let query = db.select().from(config.table).where(and(...conditions)).$dynamic();
      if (config.orderBy) query = query.orderBy(asc(config.orderBy));
      else query = query.orderBy(desc(sql`created_at`));

      const rows = await query.limit(limit);
      return jsonOk({ data: rows });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function makeCreateHandler(config: CrudConfig) {
  return async function POST(request: Request): Promise<Response> {
    try {
      const ctx = await requirePermission(config.writePermission);
      const parsed = config.createSchema.parse(await request.json().catch(() => null));
      const values = config.transformCreate ? await config.transformCreate(parsed, ctx) : parsed;
      const db = getDb();
      const [row] = await db.insert(config.table).values({ ...values, organizationId: ctx.user.organizationId }).returning();
      await logAudit(auditCtx(ctx), `${config.entity}.created`, config.entity, (row as { id: string }).id);
      return jsonOk({ data: row }, 201);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function makeGetHandler(config: CrudConfig, idColumn: PgColumn) {
  return async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
    try {
      const ctx = await requirePermission(config.readPermission);
      const { id } = await params;
      const row = (await getDb().select().from(config.table).where(and(eq(config.table.organizationId as never, ctx.user.organizationId), eq(idColumn, id))).limit(1))[0];
      if (!row) throw new HttpError(404, `${config.entity} not found`);
      return jsonOk({ data: row });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function makeUpdateHandler(config: CrudConfig, idColumn: PgColumn) {
  return async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
    try {
      const ctx = await requirePermission(config.writePermission);
      const { id } = await params;
      const parsed = config.updateSchema.parse(await request.json().catch(() => null));
      const db = getDb();
      const conditions = [eq(config.table.organizationId as never, ctx.user.organizationId), eq(idColumn, id)];
      if (config.softDelete) conditions.push(isNull((config.table as unknown as { deletedAt: PgColumn }).deletedAt));
      const [row] = await db.update(config.table).set(parsed).where(and(...conditions)).returning();
      if (!row) throw new HttpError(404, `${config.entity} not found`);
      await logAudit(auditCtx(ctx), `${config.entity}.updated`, config.entity, id, { fields: Object.keys(parsed) });
      return jsonOk({ data: row });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function makeDeleteHandler(config: CrudConfig, idColumn: PgColumn) {
  return async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
    try {
      const ctx = await requirePermission(config.writePermission);
      const { id } = await params;
      const db = getDb();
      const conditions = [eq(config.table.organizationId as never, ctx.user.organizationId), eq(idColumn, id)];
      if (config.softDelete) conditions.push(isNull((config.table as unknown as { deletedAt: PgColumn }).deletedAt));

      if (config.softDelete) {
        const [row] = await db.update(config.table).set({ deletedAt: new Date() }).where(and(...conditions)).returning();
        if (!row) throw new HttpError(404, `${config.entity} not found`);
      } else {
        const [row] = await db.delete(config.table).where(and(...conditions)).returning();
        if (!row) throw new HttpError(404, `${config.entity} not found`);
      }
      await logAudit(auditCtx(ctx), `${config.entity}.deleted`, config.entity, id);
      return jsonOk({ ok: true });
    } catch (err) {
      return errorResponse(err);
    }
  };
}
