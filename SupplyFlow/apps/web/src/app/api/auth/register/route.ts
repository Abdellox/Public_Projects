import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema, slugifyUnique } from "@supplyflow/database";
import { hashPassword, createSession, SESSION_COOKIE } from "@supplyflow/auth";
import { parseOrThrow, registerSchema, createOrgSchema } from "@supplyflow/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const intent = (body as { intent?: string })?.intent;

  if (intent === "create-org") {
    const parsed = parseOrThrow(createOrgSchema, body);
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const { getSessionUser } = await import("@supplyflow/auth");
    const user = await getSessionUser(token);
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const db = getDb();
    const slug = await slugifyUnique(db, parsed.name);
    const [org] = await db.insert(schema.organizations).values({
      name: parsed.name,
      slug,
      currency: parsed.currency,
      timezone: parsed.timezone
    }).returning();
    await db.insert(schema.memberships).values({
      organizationId: org.id,
      userId: user.userId,
      role: "owner"
    });
    return NextResponse.json({ organizationId: org.id, slug });
  }

  const parsed = parseOrThrow(registerSchema, body);
  const db = getDb();

  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, parsed.email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const [user] = await db.insert(schema.users).values({
    email: parsed.email.toLowerCase(),
    name: parsed.name,
    passwordHash: hashPassword(parsed.password)
  }).returning();

  const { token } = await createSession(user.id, {
    userAgent: request.headers.get("user-agent") ?? undefined,
    ip: request.headers.get("x-forwarded-for") ?? undefined
  });

  const res = NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  setSessionCookie(res, token);
  return res;
}

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60
  });
}
