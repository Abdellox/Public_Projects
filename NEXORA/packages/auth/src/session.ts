import { and, eq, isNull, gt, ne } from "drizzle-orm";
import { userSessions as sessions, users } from "@nexora/database";
import type { Db } from "@nexora/database";
import { generateSessionToken, hashToken } from "./tokens.js";

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const LAST_USED_UPDATE_THROTTLE_MS = 60_000;

export interface CreateSessionInput {
  userId: string;
  ip?: string | null;
  userAgent?: string | null;
  ttlMs?: number;
}

export interface ResolvedSession {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    interests: string[];
  };
}

/**
 * Session lifecycle. The database is authoritative; cookies only carry the
 * opaque token. Expired/revoked sessions and soft-deleted users never resolve.
 */
export class SessionService {
  constructor(private readonly db: Db) {}

  async create(input: CreateSessionInput): Promise<{ token: string; expiresAt: Date }> {
    const token = generateSessionToken();
    const ttl = input.ttlMs ?? DEFAULT_TTL_MS;
    const expiresAt = new Date(Date.now() + ttl);
    await this.db.insert(sessions).values({
      userId: input.userId,
      tokenHash: hashToken(token),
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt
    });
    return { token, expiresAt };
  }

  async resolve(token: string): Promise<ResolvedSession | null> {
    const tokenHash = hashToken(token);
    const rows = await this.db
      .select({
        sessionId: sessions.id,
        expiresAt: sessions.expiresAt,
        lastUsedAt: sessions.lastUsedAt,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          avatarUrl: users.avatarUrl,
          bio: users.bio,
          interests: users.interests
        }
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const now = Date.now();
    if (!row.lastUsedAt || now - row.lastUsedAt.getTime() > LAST_USED_UPDATE_THROTTLE_MS) {
      // Throttled write: avoids hammering the DB on every request.
      void this.db
        .update(sessions)
        .set({ lastUsedAt: new Date() })
        .where(eq(sessions.id, row.sessionId))
        .catch(() => undefined);
    }

    return {
      sessionId: row.sessionId,
      userId: row.user.id,
      expiresAt: row.expiresAt,
      user: row.user
    };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
  }

  async revokeByToken(token: string): Promise<void> {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, hashToken(token)));
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void> {
    const predicates = [eq(sessions.userId, userId), isNull(sessions.revokedAt)];
    if (exceptSessionId) predicates.push(ne(sessions.id, exceptSessionId));
    await this.db.update(sessions).set({ revokedAt: new Date() }).where(and(...predicates));
  }
}
