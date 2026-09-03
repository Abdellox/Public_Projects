import { hashSessionToken, generateSessionToken } from "./tokens.js";

export const SESSION_COOKIE_NAME = "pf_session";
export const SESSION_TTL_DAYS = 14;

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  isPlatformAdmin?: boolean;
  avatarUrl?: string | null;
}

export interface StoredSession {
  id: string;
  userId: string;
  expiresAt: Date;
  user: StoredUser;
}

/** Structural subset of PrismaClient used for session persistence. */
export interface SessionStoreDb {
  session: {
    create(args: { data: Record<string, unknown> }): Promise<{ id: string; expiresAt: Date }>;
    findUnique(args: {
      where: { tokenHash: string };
      include?: unknown;
    }): Promise<StoredSession | null>;
    delete(args: { where: { id: string } | { userId: string } }): Promise<unknown>;
    deleteMany(args: { where: { userId: string } }): Promise<unknown>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<unknown>;
  };
}

export async function createSession(
  db: SessionStoreDb,
  opts: {
    userId: string;
    secret: string;
    ip?: string;
    userAgent?: string;
    ttlDays?: number;
  },
): Promise<string> {
  const token = generateSessionToken();
  const ttl = opts.ttlDays ?? SESSION_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttl * 24 * 60 * 60 * 1000);
  await db.session.create({
    data: {
      userId: opts.userId,
      tokenHash: hashSessionToken(token, opts.secret),
      expiresAt,
      ip: opts.ip ?? null,
      userAgent: opts.userAgent ?? null,
    },
  });
  return token;
}

export async function getValidSession(
  db: SessionStoreDb,
  rawToken: string | undefined | null,
  secret: string,
): Promise<StoredSession | null> {
  if (!rawToken) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(rawToken, secret) },
    include: { user: true } as never,
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session;
}

export async function revokeSession(db: SessionStoreDb, sessionId: string): Promise<void> {
  await db.session.delete({ where: { id: sessionId } }).catch(() => undefined);
}

export async function revokeAllSessions(db: SessionStoreDb, userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } }).catch(() => undefined);
}

export async function extendSession(db: SessionStoreDb, sessionId: string, secret: string): Promise<void> {
  await db.session
    .update({
      where: { id: sessionId },
      data: { expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000) },
    })
    .catch(() => undefined);
}
