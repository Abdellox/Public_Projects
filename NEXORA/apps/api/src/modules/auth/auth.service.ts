import { and, eq } from "drizzle-orm";
import type { Db } from "@nexora/database";
import { organizations, organizationMemberships, roles, users } from "@nexora/database";
import type { SessionService} from "@nexora/auth";
import { hashPassword, verifyPassword } from "@nexora/auth";
import { conflict, unauthorized, type MeResponse, type PublicUser } from "@nexora/types";

export interface AuthMeta {
  ip?: string | null;
  userAgent?: string | null;
}

function toPublicUser(row: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  interests: string[];
}): PublicUser {
  return row;
}

export class AuthService {
  constructor(
    private readonly db: Db,
    private readonly sessions: SessionService
  ) {}

  async register(
    input: { name: string; email: string; password: string },
    meta: AuthMeta
  ): Promise<{ user: PublicUser; token: string; expiresAt: Date }> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    if (existing.length > 0) {
      throw conflict("EMAIL_TAKEN", "An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const inserted = await this.db
      .insert(users)
      .values({ email: input.email, passwordHash, name: input.name })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        interests: users.interests
      });
    const user = inserted[0];
    if (!user) throw new Error("user_insert_returned_no_rows");

    const { token, expiresAt } = await this.sessions.create({
      userId: user.id,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null
    });

    return { user: toPublicUser(user), token, expiresAt };
  }

  async login(
    input: { email: string; password: string },
    meta: AuthMeta
  ): Promise<{ user: PublicUser; token: string; expiresAt: Date }> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        interests: users.interests,
        passwordHash: users.passwordHash,
        deletedAt: users.deletedAt
      })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    const row = rows[0];

    // Uniform error for unknown email and wrong password — no account enumeration.
    if (!row || row.deletedAt) throw unauthorized("Invalid email or password");
    const ok = await verifyPassword(row.passwordHash, input.password);
    if (!ok) throw unauthorized("Invalid email or password");

    await this.db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, row.id));

    const { token, expiresAt } = await this.sessions.create({
      userId: row.id,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null
    });

    return {
      user: toPublicUser({
        id: row.id,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatarUrl,
        bio: row.bio,
        interests: row.interests
      }),
      token,
      expiresAt
    };
  }

  async me(userId: string): Promise<MeResponse> {
    const userRows = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        interests: users.interests
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const user = userRows[0];
    if (!user) throw unauthorized("Account not found");
    return { user: toPublicUser(user), memberships: await this.memberships(userId) };
  }

  private async memberships(userId: string): Promise<MeResponse["memberships"]> {
    const rows = await this.db
      .select({
        id: organizationMemberships.id,
        status: organizationMemberships.status,
        departmentId: organizationMemberships.departmentId,
        teamId: organizationMemberships.teamId,
        jobTitleId: organizationMemberships.jobTitleId,
        roleKey: roles.key,
        roleName: roles.name,
        organizationId: organizations.id,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
        organizationDescription: organizations.description,
        organizationLogoUrl: organizations.logoUrl
      })
      .from(organizationMemberships)
      .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .where(and(eq(organizationMemberships.userId, userId)))
      .orderBy(organizationMemberships.createdAt);

    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      departmentId: r.departmentId,
      teamId: r.teamId,
      jobTitleId: r.jobTitleId,
      roleKey: r.roleKey as MeResponse["memberships"][number]["roleKey"],
      roleName: r.roleName,
      organization: {
        id: r.organizationId,
        name: r.organizationName,
        slug: r.organizationSlug,
        description: r.organizationDescription,
        logoUrl: r.organizationLogoUrl
      }
    }));
  }
}
