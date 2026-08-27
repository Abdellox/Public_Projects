import { and, eq, isNull } from 'drizzle-orm';
import {
  getDb,
  organizations,
  organizationMemberships,
  roles,
  sessions,
  users,
} from '@nexora/database';
import { generateToken, hashPassword, hashToken, sessionExpiry, verifyPassword } from '@nexora/auth';
import type { MembershipSummary, SessionUser } from '@nexora/types';
import { ApiError } from '../../lib/errors';

const TIMING_SAFE_DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$YXJnb24yaWRpZGRvY3VtZW50$K17B6S9eL0OQc7u2dWmWnHq1xGhVzP3nE5jR8sT4uYw';

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<SessionUser> {
  const db = getDb();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash: await hashPassword(input.password),
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      jobTitle: users.jobTitle,
    });
  return user!;
}

export async function authenticate(email: string, password: string): Promise<SessionUser> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  const ok = row
    ? await verifyPassword(row.passwordHash, password)
    : await verifyPassword(TIMING_SAFE_DUMMY_HASH, password).catch(() => false);

  if (!row || !ok || row.status !== 'active') {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, row.id));

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    jobTitle: row.jobTitle,
  };
}

export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string },
): Promise<string> {
  const db = getDb();
  const token = generateToken();
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: sessionExpiry(),
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
  });
  return token;
}

export async function revokeSession(sessionId: string): Promise<void> {
  const db = getDb();
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)));
}

export async function listMemberships(userId: string): Promise<MembershipSummary[]> {
  const db = getDb();
  return db
    .select({
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      roleKey: roles.key,
      roleName: roles.name,
      status: organizationMemberships.status,
    })
    .from(organizationMemberships)
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
    .where(
      and(eq(organizationMemberships.userId, userId), isNull(organizations.deletedAt)),
    );
}
