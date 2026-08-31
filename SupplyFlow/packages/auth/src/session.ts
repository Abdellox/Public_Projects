import { and, eq, gt } from "drizzle-orm";
import { getDb, schema } from "@supplyflow/database";
import { generateSessionToken, hashSessionToken } from "./password";
import type { Role } from "@supplyflow/types";

export const SESSION_COOKIE = "sf_session";
export const SESSION_TTL_DAYS = 30;

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  currency: string;
  role: Role;
  sessionId: string;
}

export async function createSession(userId: string, meta?: { userAgent?: string; ip?: string }): Promise<{ token: string; expiresAt: Date }> {
  const db = getDb();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await getDb().insert(schema.sessions).values({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt,
    userAgent: meta?.userAgent?.slice(0, 300),
    ip: meta?.ip
  });
  return { token, expiresAt };
}

export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const db = getDb();
  const rows = await db
    .select({
      sessionId: schema.sessions.id,
      userId: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      organizationId: schema.organizations.id,
      organizationSlug: schema.organizations.slug,
      organizationName: schema.organizations.name,
      currency: schema.organizations.currency,
      role: schema.memberships.role,
      membershipId: schema.memberships.id
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.memberships, eq(schema.memberships.userId, schema.users.id))
    .innerJoin(schema.organizations, eq(schema.organizations.id, schema.memberships.organizationId))
    .where(and(eq(schema.sessions.tokenHash, hashSessionToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .orderBy(schema.memberships.createdAt)
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.userId,
    email: row.email,
    name: row.name,
    organizationId: row.organizationId,
    organizationSlug: row.organizationSlug,
    organizationName: row.organizationName,
    currency: row.currency,
    role: row.role,
    sessionId: row.sessionId
  };
}

export async function destroySession(token: string): Promise<void> {
  await getDb().delete(schema.sessions).where(eq(schema.sessions.tokenHash, hashSessionToken(token)));
}

export interface BaseUser {
  userId: string;
  email: string;
  name: string;
  hasOrganization: boolean;
}

export async function getBaseUser(token: string | undefined): Promise<BaseUser | null> {
  if (!token) return null;
  const db = getDb();
  const rows = await db
    .select({
      userId: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      organizationId: schema.memberships.organizationId
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .leftJoin(schema.memberships, eq(schema.memberships.userId, schema.users.id))
    .where(and(eq(schema.sessions.tokenHash, hashSessionToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.userId,
    email: row.email,
    name: row.name,
    hasOrganization: row.organizationId !== null
  };
}
