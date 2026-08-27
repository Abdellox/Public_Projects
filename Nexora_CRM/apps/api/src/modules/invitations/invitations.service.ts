import { and, desc, eq } from 'drizzle-orm';
import {
  departments,
  getDb,
  invitations,
  organizationMemberships,
  organizations,
  roles,
  teams,
} from '@nexora/database';
import { generateToken, hashToken, invitationExpiry } from '@nexora/auth';
import type { MembershipSummary } from '@nexora/types';
import { ApiError, isUniqueViolation } from '../../lib/errors';

export interface InvitationView {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  departmentId: string | null;
  teamId: string | null;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}

export async function createInvitation(params: {
  organizationId: string;
  invitedByUserId: string;
  email: string;
  roleId: string;
  departmentId?: string | null;
  teamId?: string | null;
}): Promise<{ invitation: InvitationView; token: string }> {
  const db = getDb();

  const [role] = await db
    .select()
    .from(roles)
    .where(
      and(eq(roles.id, params.roleId), eq(roles.organizationId, params.organizationId)),
    )
    .limit(1);
  if (!role) throw ApiError.badRequest('Unknown role for this organization');
  if (role.key === 'owner') {
    throw ApiError.badRequest('Ownership cannot be granted by invitation');
  }

  if (params.departmentId) {
    const [dept] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          eq(departments.id, params.departmentId),
          eq(departments.organizationId, params.organizationId),
        ),
      )
      .limit(1);
    if (!dept) throw ApiError.badRequest('Unknown department for this organization');
  }

  if (params.teamId) {
    const [team] = await db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.id, params.teamId), eq(teams.organizationId, params.organizationId)))
      .limit(1);
    if (!team) throw ApiError.badRequest('Unknown team for this organization');
  }

  const [pending] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(
      and(
        eq(invitations.organizationId, params.organizationId),
        eq(invitations.email, params.email),
        eq(invitations.status, 'pending'),
      ),
    )
    .limit(1);
  if (pending) {
    throw ApiError.conflict('An invitation for this email is already pending');
  }

  const token = generateToken();
  const [invitation] = await db
    .insert(invitations)
    .values({
      organizationId: params.organizationId,
      email: params.email,
      roleId: params.roleId,
      departmentId: params.departmentId ?? null,
      teamId: params.teamId ?? null,
      invitedByUserId: params.invitedByUserId,
      tokenHash: hashToken(token),
      expiresAt: invitationExpiry(),
    })
    .returning({
      id: invitations.id,
      email: invitations.email,
      roleId: invitations.roleId,
      departmentId: invitations.departmentId,
      teamId: invitations.teamId,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
    });

  return { invitation: { ...invitation!, roleName: role.name }, token };
}

export async function listInvitations(
  organizationId: string,
): Promise<InvitationView[]> {
  const db = getDb();
  return db
    .select({
      id: invitations.id,
      email: invitations.email,
      roleId: invitations.roleId,
      roleName: roles.name,
      departmentId: invitations.departmentId,
      teamId: invitations.teamId,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
    })
    .from(invitations)
    .innerJoin(roles, eq(roles.id, invitations.roleId))
    .where(
      and(eq(invitations.organizationId, organizationId), eq(invitations.status, 'pending')),
    )
    .orderBy(desc(invitations.createdAt));
}

export async function revokeInvitation(
  organizationId: string,
  invitationId: string,
): Promise<void> {
  const db = getDb();
  const result = await db
    .update(invitations)
    .set({ status: 'revoked' })
    .where(
      and(
        eq(invitations.id, invitationId),
        eq(invitations.organizationId, organizationId),
        eq(invitations.status, 'pending'),
      ),
    )
    .returning({ id: invitations.id });
  if (result.length === 0) throw ApiError.notFound('Pending invitation not found');
}

export async function acceptInvitation(
  user: { id: string; email: string },
  rawToken: string,
): Promise<{
  organizationId: string;
  membershipId: string;
  membership: MembershipSummary;
}> {
  const db = getDb();
  const tokenHash = hashToken(rawToken);

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.tokenHash, tokenHash))
    .limit(1);

  if (!invitation || invitation.status !== 'pending') {
    throw ApiError.badRequest('This invitation is no longer valid');
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    await db
      .update(invitations)
      .set({ status: 'expired' })
      .where(eq(invitations.id, invitation.id));
    throw ApiError.badRequest('This invitation has expired');
  }
  if (invitation.email !== user.email.toLowerCase()) {
    throw ApiError.forbidden(
      'This invitation was sent to a different email address',
    );
  }

  try {
    return await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(organizationMemberships)
        .values({
          organizationId: invitation.organizationId,
          userId: user.id,
          roleId: invitation.roleId,
          departmentId: invitation.departmentId,
          teamId: invitation.teamId,
        })
        .returning({ id: organizationMemberships.id });

      await tx
        .update(invitations)
        .set({ status: 'accepted', acceptedAt: new Date() })
        .where(eq(invitations.id, invitation.id));

      const [orgRow] = await tx
        .select({
          organizationId: organizations.id,
          organizationName: organizations.name,
          organizationSlug: organizations.slug,
          roleKey: roles.key,
          roleName: roles.name,
        })
        .from(organizations)
        .innerJoin(roles, eq(roles.id, invitation.roleId))
        .where(eq(organizations.id, invitation.organizationId))
        .limit(1);

      const summary: MembershipSummary = { ...orgRow!, status: 'active' };

      return {
        organizationId: invitation.organizationId,
        membershipId: inserted!.id,
        membership: summary,
      };
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw ApiError.conflict('You are already a member of this organization');
    }
    throw err;
  }
}
