import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema, logAudit } from "@supplyflow/database";
import { verifyPassword, createSession, SESSION_COOKIE } from "@supplyflow/auth";
import { parseOrThrow, loginSchema } from "@supplyflow/validation";

export async function POST(request: Request) {
  const parsed = parseOrThrow(loginSchema, await request.json().catch(() => null));
  const db = getDb();

  const user = (await db.select().from(schema.users).where(eq(schema.users.email, parsed.email.toLowerCase())).limit(1))[0];
  if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? undefined;
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));

  const { token } = await createSession(user.id, { userAgent: request.headers.get("user-agent") ?? undefined, ip });
  await logAudit({ organizationId: "", userId: user.id, ip }, "auth.login");

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60
  });
  return res;
}
