import { createMiddleware } from 'hono/factory';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { getDb, sessions, users } from '@nexora/database';
import { hashToken, SESSION_REFRESH_THRESHOLD_MS } from '@nexora/auth';
import { ApiError } from '../lib/errors';
import { readSessionToken } from '../lib/cookies';
import type { AppEnv } from '../types';

export const resolveSession = createMiddleware<AppEnv>(async (c, next) => {
  const token = readSessionToken(c);
  if (token) {
    const db = getDb();
    const tokenHash = hashToken(token);

    const [row] = await db
      .select({
        sessionId: sessions.id,
        lastUsedAt: sessions.lastUsedAt,
        userId: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        jobTitle: users.jobTitle,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, sql`now()`),
          isNull(users.deletedAt),
          eq(users.status, 'active'),
        ),
      )
      .limit(1);

    if (row) {
      if (Date.now() - row.lastUsedAt.getTime() > SESSION_REFRESH_THRESHOLD_MS) {
        await db
          .update(sessions)
          .set({ lastUsedAt: new Date() })
          .where(eq(sessions.id, row.sessionId));
      }
      c.set('session', {
        sessionId: row.sessionId,
        id: row.userId,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatarUrl,
        jobTitle: row.jobTitle,
      });
    }
  }
  await next();
});

export function requireSession() {
  return createMiddleware<AppEnv>(async (c, next) => {
    if (!c.get('session')) throw ApiError.unauthorized();
    await next();
  });
}
