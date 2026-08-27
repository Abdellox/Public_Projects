import { and, desc, eq, isNull } from "drizzle-orm";
import type { Db } from "@nexora/database";
import {
  invitations,
  organizationMemberships,
  roles,
  users
} from "@nexora/database";
import { hashToken, generateSessionToken } from "@nexora/auth";
import { badRequest, conflict, forbidden, gone, notFound } from "@nexora/types";
import type { PermissionCache } from "../../policy/policy.js";
import { authorize } from "../../policy/policy.js";

const OWNER_ROLE_KEY = "owner";

export class InvitationsService {
  constructor(
    private readonly db: Db,
    private readonly permissions: PermissionCache
  ) {}

  async create(
    organizationId: string,
    actorUserId: string,
    input: { email: string; roleId: string },
    opts: { tokenTtlMs: number }
  ): Promise<{ id: string; email: string; expiresAt: Date; token: string }> {
    await authorize(this.db, this.permissions, organizationId, actorUserId, "member:invite");

    const roleRows = await this.db
      .select({ key: roles.key })
      .from(roles)
      .where(and(eq(roles.id, input.roleId), eq(roles.organizationId, organizationId)))
      .limit(1);
    const role = roleRows[0];
    if (!role) throw badRequest("Role does not belong to this organization");
    // Ownership is never granted via invitation — transfer is an explicit
    // owner-only operation (future phase).
    if (role.key === OWNER_ROLE_KEY) throw badRequest("The owner role cannot be invited");

    const existingMember = await this.db
      .select({ id: organizationMemberships.id })
      .from(organizationMemberships)
      .innerJoin(users, eq(users.id, organizationMemberships.userId))
      .where(
        and(eq(organizationMemberships.organizationId, organizationId), eq(users.email, input.email))
      )
      .limit(1);
    if (existingMember.length > 0) throw conflict("ALREADY_MEMBER", "This person is already a member");

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + opts.tokenTtlMs);

    const inserted = await this.db
      .insert(invitations)
      .values({
        organizationId,
        email: input.email.toLowerCase(),
        roleId: input.roleId,
        tokenHash: hashToken(token),
        invitedBy: actorUserId,
        expiresAt
      })
      .returning({ id: invitations.id });
    const inv = inserted[0];
    if (!inv) throw new Error("invitation_insert_returned_no_rows");

    return { id: inv.id, email: input.email, expiresAt, token };
  }

  async list(organizationId: string, actorUserId: string) {
    await authorize(this.db, this.permissions, organizationId, actorUserId, "member:invite");
    return this.db
      .select({
        id: invitations.id,
        email: invitations.email,
        roleName: roles.name,
        expiresAt: invitations.expiresAt,
        acceptedAt: invitations.acceptedAt,
        revokedAt: invitations.revokedAt,
        createdAt: invitations.createdAt,
        invitedByName: users.name
      })
      .from(invitations)
      .innerJoin(roles, eq(roles.id, invitations.roleId))
      .leftJoin(users, eq(users.id, invitations.invitedBy))
      .where(eq(invitations.organizationId, organizationId))
      .orderBy(desc(invitations.createdAt))
      .limit(100);
  }

  async revoke(organizationId: string, actorUserId: string, invitationId: string) {
    await authorize(this.db, this.permissions, organizationId, actorUserId, "member:invite");
    await this.db
      .update(invitations)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(invitations.id, invitationId), eq(invitations.organizationId, organizationId))
      );
    return { ok: true };
  }

  /**
   * Accepts a pending invitation. The accepting user's email must match the
   * invited address — invitations are credentials for a specific identity.
   */
  async accept(
    userId: string,
    userEmail: string,
    rawToken: string
  ): Promise<{ organizationId: string }> {
    const tokenHash = hashToken(rawToken);
    const rows = await this.db
      .select()
      .from(invitations)
      .where(and(eq(invitations.tokenHash, tokenHash), isNull(invitations.revokedAt), isNull(invitations.acceptedAt)))
      .limit(1);
    const inv = rows[0];
    if (!inv) throw notFound("Invitation not found or no longer valid");
    if (inv.expiresAt.getTime() < Date.now()) throw gone("INVITATION_EXPIRED", "This invitation has expired");
    if (inv.email !== userEmail.toLowerCase()) {
      throw forbidden("Sign in with the email address this invitation was sent to");
    }

    const roleRows = await this.db
      .select({ key: roles.key })
      .from(roles)
      .where(and(eq(roles.id, inv.roleId), eq(roles.organizationId, inv.organizationId)))
      .limit(1);
    const role = roleRows[0];
    if (!role) throw notFound("Invitation not found or no longer valid");

    const result = await this.db.transaction(async (tx) => {
      const inserted = await tx
        .insert(organizationMemberships)
        .values({
          organizationId: inv.organizationId,
          userId,
          roleId: inv.roleId,
          status: "active"
        })
        .onConflictDoNothing()
        .returning({ id: organizationMemberships.id });

      if (inserted.length === 0) {
        throw conflict("ALREADY_MEMBER", "You are already a member of this organization");
      }

      await tx
        .update(invitations)
        .set({ acceptedAt: new Date(), acceptedBy: userId })
        .where(eq(invitations.id, inv.id));

      return { organizationId: inv.organizationId };
    });

    this.permissions.invalidate(result.organizationId);
    return result;
  }
}
