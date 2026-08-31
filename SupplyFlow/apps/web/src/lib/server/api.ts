import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, getSessionUser, type SessionUser } from "@supplyflow/auth";
import { hasPermission, type Permission } from "@supplyflow/types";

export interface ApiContext {
  user: SessionUser;
  ip?: string;
  userAgent?: string;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonOk(data: unknown, init?: number): NextResponse {
  return NextResponse.json(data as Record<string, unknown>, { status: init ?? 200 });
}

export async function requireUser(): Promise<ApiContext> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) throw new HttpError(401, "Authentication required");
  const h = await headers();
  return {
    user,
    ip: h.get("x-forwarded-for") ?? undefined,
    userAgent: h.get("user-agent") ?? undefined
  };
}

export async function requirePermission(permission: Permission): Promise<ApiContext> {
  const ctx = await requireUser();
  if (!hasPermission(ctx.user.role, permission)) {
    throw new HttpError(403, `Missing permission: ${permission}`);
  }
  return ctx;
}

export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const anyErr = err as Error & { status?: number };
    const status = typeof anyErr.status === "number" ? anyErr.status : 500;
    const message = status === 500 ? "Internal server error" : anyErr.message;
    if (status === 500) console.error("[api]", err);
    return NextResponse.json({ error: message }, { status });
  }
}

export function auditCtx(ctx: ApiContext) {
  return {
    organizationId: ctx.user.organizationId,
    userId: ctx.user.userId,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  };
}

export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof z.ZodError) {
    const issues = err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    return Response.json({ error: `Validation failed — ${issues}` }, { status: 400 });
  }
  const anyErr = err as Error & { status?: number; code?: string };
  if (anyErr.code === "23505") {
    return Response.json({ error: "A record with this unique value already exists" }, { status: 409 });
  }
  if (anyErr.code === "23503") {
    return Response.json({ error: "Referenced record does not exist" }, { status: 400 });
  }
  if (typeof anyErr.status === "number") {
    return Response.json({ error: anyErr.message }, { status: anyErr.status });
  }
  console.error("[api]", err);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
