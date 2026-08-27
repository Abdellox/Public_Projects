import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import type { Db } from "@nexora/database";
import {
  departments,
  jobTitles,
  organizationMemberships,
  roles,
  skills,
  teams,
  userSkills,
  users
} from "@nexora/database";
import { badRequest, conflict, forbidden, notFound } from "@nexora/types";
import { decodeCursor, encodeCursor, cursorBefore } from "@nexora/database";
import type { CursorPage, MemberListItem } from "@nexora/types";
import type { PermissionCache } from "../../policy/policy.js";
import { authorize } from "../../policy/policy.js";

export class MembersService {
  constructor(
    private readonly db: Db,
    private readonly permissions: PermissionCache
  ) {}

  async list(
    organizationId: string,
    userId: string,
    query: {
      cursor?: string;
      limit: number;
      q?: string;
      departmentId?: string;
      teamId?: string;
    }
  ): Promise<CursorPage<MemberListItem>> {
    await authorize(this.db, this.permissions, organizationId, userId, "member:view");

    const predicates = [
      eq(organizationMemberships.organizationId, organizationId),
      isNull(users.deletedAt)
    ];
    if (query.q) {
      const pattern = `%${query.q}%`;
      predicates.push(or(ilike(users.name, pattern), ilike(users.email, pattern))!);
    }
    if (query.departmentId) predicates.push(eq(organizationMemberships.departmentId, query.departmentId));
    if (query.teamId) predicates.push(eq(organizationMemberships.teamId, query.teamId));

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;
    if (cursor) predicates.push(cursorBefore(organizationMemberships.createdAt, organizationMemberships.id, cursor));

    const rows = await this.db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        membershipId: organizationMemberships.id,
        roleKey: roles.key,
        roleName: roles.name,
        departmentId: departments.id,
        departmentName: departments.name,
        teamId: teams.id,
        teamName: teams.name,
        jobTitleId: jobTitles.id,
        jobTitleName: jobTitles.name,
        status: organizationMemberships.status,
        joinedAt: organizationMemberships.createdAt
      })
      .from(organizationMemberships)
      .innerJoin(users, eq(users.id, organizationMemberships.userId))
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .leftJoin(departments, eq(departments.id, organizationMemberships.departmentId))
      .leftJoin(teams, eq(teams.id, organizationMemberships.teamId))
      .leftJoin(jobTitles, eq(jobTitles.id, organizationMemberships.jobTitleId))
      .where(and(...predicates))
      .orderBy(desc(organizationMemberships.createdAt), desc(organizationMemberships.id))
      .limit(query.limit + 1);

    const page = rows.slice(0, query.limit);
    const userIds = page.map((r) => r.userId);

    const skillRows =
      userIds.length > 0
        ? await this.db
            .select({ userId: userSkills.userId, name: skills.name })
            .from(userSkills)
            .innerJoin(skills, eq(skills.id, userSkills.skillId))
            .where(and(inArray(userSkills.userId, userIds), eq(userSkills.organizationId, organizationId)))
            .orderBy(asc(skills.name))
        : [];

    const items = page.map((r) => ({
      userId: r.userId,
      name: r.name,
      email: r.email,
      avatarUrl: r.avatarUrl,
      membershipId: r.membershipId,
      roleKey: r.roleKey as MemberListItem["roleKey"],
      roleName: r.roleName,
      departmentId: r.departmentId,
      departmentName: r.departmentName,
      teamId: r.teamId,
      teamName: r.teamName,
      jobTitleId: r.jobTitleId,
      jobTitleName: r.jobTitleName,
      skills: skillRows.filter((s) => s.userId === r.userId).map((s) => s.name),
      status: r.status,
      joinedAt: r.joinedAt.toISOString()
    }));

    let nextCursor: string | null = null;
    if (rows.length > query.limit && items.length > 0) {
      const last = items[items.length - 1];
      if (last) nextCursor = encodeCursor({ at: last.joinedAt, id: last.membershipId });
    }

    return { items, nextCursor };
  }

  /** Counts active owners excluding one membership — used to protect the last owner. */
  private async otherActiveOwnerCount(organizationId: string, excludeMembershipId: string) {
    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMemberships)
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .where(
        and(
          eq(organizationMemberships.organizationId, organizationId),
          eq(roles.key, "owner"),
          eq(organizationMemberships.status, "active"),
          sql`${organizationMemberships.id} <> ${excludeMembershipId}`
        )
      );
    return rows[0]?.count ?? 0;
  }

  private async membershipOr404(organizationId: string, membershipId: string) {
    const rows = await this.db
      .select({
        membershipId: organizationMemberships.id,
        organizationId: organizationMemberships.organizationId,
        userId: organizationMemberships.userId,
        roleId: roles.id,
        roleKey: roles.key,
        status: organizationMemberships.status
      })
      .from(organizationMemberships)
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .where(
        and(
          eq(organizationMemberships.id, membershipId),
          eq(organizationMemberships.organizationId, organizationId)
        )
      )
      .limit(1);
    const m = rows[0];
    if (!m) throw notFound("Member not found");
    return m;
  }

  /**
   * Admin member update: role, placement and status.
   * Role changes additionally require role:manage; the last active owner can
   * never be demoted, suspended or removed through this endpoint.
   */
  async updateMember(
    organizationId: string,
    actorUserId: string,
    membershipId: string,
    patch: {
      roleId?: string;
      departmentId?: string | null;
      teamId?: string | null;
      jobTitleId?: string | null;
      status?: "active" | "suspended";
    }
  ) {
    const { permissions } = await authorize(
      this.db,
      this.permissions,
      organizationId,
      actorUserId,
      "member:update"
    );

    const target = await this.membershipOr404(organizationId, membershipId);

    if (patch.roleId && !permissions.has("role:manage")) {
      throw forbidden("Changing roles requires the role:manage permission");
    }
    if (patch.roleId) {
      const roleRows = await this.db
        .select({ key: roles.key })
        .from(roles)
        .where(and(eq(roles.id, patch.roleId), eq(roles.organizationId, organizationId)))
        .limit(1);
      const role = roleRows[0];
      if (!role) throw badRequest("Role does not belong to this organization");
    }
    if (patch.departmentId) {
      const deptRows = await this.db
        .select({ id: departments.id })
        .from(departments)
        .where(
          and(
            eq(departments.id, patch.departmentId),
            eq(departments.organizationId, organizationId),
            isNull(departments.deletedAt)
          )
        )
        .limit(1);
      if (deptRows.length === 0) throw badRequest("Department does not belong to this organization");
    }
    if (patch.jobTitleId) {
      const titleRows = await this.db
        .select({ id: jobTitles.id })
        .from(jobTitles)
        .where(
          and(eq(jobTitles.id, patch.jobTitleId), eq(jobTitles.organizationId, organizationId))
        )
        .limit(1);
      if (titleRows.length === 0) throw badRequest("Job title does not belong to this organization");
    }

    // Team must live in the resulting department.
    if (patch.teamId !== undefined) {
      if (patch.teamId === null) {
        // explicit clear — fine on its own
      } else {
        const teamRows = await this.db
          .select({ departmentId: teams.departmentId })
          .from(teams)
          .where(
            and(eq(teams.id, patch.teamId), eq(teams.organizationId, organizationId), isNull(teams.deletedAt))
          )
          .limit(1);
        const team = teamRows[0];
        if (!team) throw badRequest("Team does not belong to this organization");

        const effectiveDeptId = patch.departmentId !== undefined ? patch.departmentId : undefined;
        let resolvedDeptId = effectiveDeptId ?? null;
        if (effectiveDeptId === undefined || effectiveDeptId === null) {
          const current = await this.db
            .select({ departmentId: organizationMemberships.departmentId })
            .from(organizationMemberships)
            .where(eq(organizationMemberships.id, membershipId))
            .limit(1);
          resolvedDeptId = current[0]?.departmentId ?? null;
        }
        if (resolvedDeptId !== team.departmentId) {
          throw badRequest("Team belongs to a different department than the member");
        }
      }
    }

    const touchingOwner =
      target.roleKey === "owner" &&
      ((patch.roleId !== undefined && patch.roleId !== target.roleId) ||
        (patch.status !== undefined && patch.status !== "active"));

    if (touchingOwner) {
      const others = await this.otherActiveOwnerCount(organizationId, membershipId);
      if (others === 0) throw conflict("LAST_OWNER", "The organization must keep at least one owner");
    }

    await this.db
      .update(organizationMemberships)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(organizationMemberships.id, membershipId));
    this.permissions.invalidate(organizationId);

    return { ok: true };
  }

  async removeMember(organizationId: string, actorUserId: string, membershipId: string) {
    await authorize(this.db, this.permissions, organizationId, actorUserId, "member:remove");
    const target = await this.membershipOr404(organizationId, membershipId);

    if (target.userId === actorUserId) {
      throw badRequest("Use account settings to leave an organization (not yet available)");
    }
    if (target.roleKey === "owner") {
      const others = await this.otherActiveOwnerCount(organizationId, membershipId);
      if (others === 0) throw conflict("LAST_OWNER", "The organization must keep at least one owner");
    }

    await this.db
      .delete(organizationMemberships)
      .where(eq(organizationMemberships.id, membershipId));
    this.permissions.invalidate(organizationId);
    return { ok: true };
  }

  /** Used by the self-service endpoints to verify ownership of a membership. */
  async ownMembership(userId: string, membershipId: string) {
    const rows = await this.db
      .select({
        membershipId: organizationMemberships.id,
        organizationId: organizationMemberships.organizationId,
        status: organizationMemberships.status,
        userId: organizationMemberships.userId
      })
      .from(organizationMemberships)
      .where(eq(organizationMemberships.id, membershipId))
      .limit(1);
    const m = rows[0];
    if (!m || m.status !== "active") throw notFound("Membership not found");
    if (m.userId !== userId) throw forbidden("This membership belongs to another member");
    return m;
  }
}
