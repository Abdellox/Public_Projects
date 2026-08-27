import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@nexora/database";
import {
  departments,
  jobTitles,
  organizationMemberships,
  organizations,
  rolePermissions,
  roles,
  skills,
  teams,
  users
} from "@nexora/database";
import { DEFAULT_ROLE_PERMISSIONS, ROLE_KEYS, notFound, type OrganizationOverview, type RoleKey } from "@nexora/types";
import type { PermissionCache } from "../../policy/policy.js";
import { authorize, effectivePermissions } from "../../policy/policy.js";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

async function generateUniqueOrgSlug(db: Db, desired: string): Promise<string> {
  const base = slugify(desired).slice(0, 48) || "org";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const hit = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, candidate))
      .limit(1);
    if (hit.length === 0) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export class OrganizationService {
  constructor(
    private readonly db: Db,
    private readonly permissions: PermissionCache
  ) {}

  /**
   * Creates an organization inside a single transaction:
   * org → system roles → default grants → owner membership.
   */
  async create(
    userId: string,
    input: { name: string; slug?: string; description?: string }
  ): Promise<{ id: string; name: string; slug: string }> {
    const slug = await generateUniqueOrgSlug(this.db, input.slug ?? input.name);

    return this.db.transaction(async (tx) => {
      const orgRows = await tx
        .insert(organizations)
        .values({
          name: input.name,
          slug,
          description: input.description ?? null,
          createdBy: userId
        })
        .returning({ id: organizations.id, name: organizations.name, slug: organizations.slug });
      const org = orgRows[0];
      if (!org) throw new Error("org_insert_returned_no_rows");

      const roleRows = await tx
        .insert(roles)
        .values(
          ROLE_KEYS.map((key) => ({
            organizationId: org.id,
            key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            isSystem: true
          }))
        )
        .returning({ id: roles.id, key: roles.key });

      const grants = Object.entries(DEFAULT_ROLE_PERMISSIONS).flatMap(([roleKey, perms]) => {
        const role = roleRows.find((r) => r.key === roleKey);
        if (!role) throw new Error(`system_role_missing:${roleKey}`);
        return perms.map((permissionKey) => ({ roleId: role.id, permissionKey }));
      });
      if (grants.length > 0) {
        await tx.insert(rolePermissions).values(grants).onConflictDoNothing();
      }

      const ownerRole = roleRows.find((r) => r.key === "owner");
      if (!ownerRole) throw new Error("owner_role_missing");

      await tx.insert(organizationMemberships).values({
        organizationId: org.id,
        userId,
        roleId: ownerRole.id,
        status: "active"
      });

      return org;
    });
  }

  async listForUser(userId: string): Promise<
    Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      logoUrl: string | null;
      roleKey: string;
      memberCount: number;
    }>
  > {
    const rows = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        logoUrl: organizations.logoUrl,
        roleKey: roles.key,
        createdAt: organizationMemberships.createdAt
      })
      .from(organizationMemberships)
      .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .where(and(eq(organizationMemberships.userId, userId), isNull(organizations.deletedAt)))
      .orderBy(desc(organizationMemberships.createdAt));

    const counts = await this.db
      .select({
        organizationId: organizationMemberships.organizationId,
        count: sql<number>`count(*)::int`
      })
      .from(organizationMemberships)
      .innerJoin(users, eq(users.id, organizationMemberships.userId))
      .where(and(isNull(users.deletedAt), eq(organizationMemberships.status, "active")))
      .groupBy(organizationMemberships.organizationId);

    return rows.map((r) => ({
      ...r,
      memberCount: counts.find((c) => c.organizationId === r.id)?.count ?? 0
    }));
  }

  async overviewBySlug(slug: string, userId: string): Promise<OrganizationOverview> {
    const orgRows = await this.db
      .select()
      .from(organizations)
      .where(and(eq(organizations.slug, slug), isNull(organizations.deletedAt)))
      .limit(1);
    const org = orgRows[0];
    // Non-members get the same 404 as missing organizations (no enumeration).
    if (!org) throw notFound("Organization not found");

    const { membership } = await authorize(this.db, this.permissions, org.id, userId);

    const [memberCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMemberships)
      .innerJoin(users, eq(users.id, organizationMemberships.userId))
      .where(
        and(
          eq(organizationMemberships.organizationId, org.id),
          eq(organizationMemberships.status, "active"),
          isNull(users.deletedAt)
        )
      );

    const deptRows = await this.db
      .select({
        id: departments.id,
        organizationId: departments.organizationId,
        name: departments.name,
        slug: departments.slug,
        description: departments.description,
        color: departments.color,
        createdAt: departments.createdAt,
        memberCount: sql<number>`count(${organizationMemberships.id})::int`
      })
      .from(departments)
      .leftJoin(
        organizationMemberships,
        eq(organizationMemberships.departmentId, departments.id)
      )
      .where(and(eq(departments.organizationId, org.id), isNull(departments.deletedAt)))
      .groupBy(departments.id)
      .orderBy(asc(departments.name))
      .limit(100);

    const teamCountRows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(teams)
      .where(and(eq(teams.organizationId, org.id), isNull(teams.deletedAt)));

    const titleCountRows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobTitles)
      .where(eq(jobTitles.organizationId, org.id));

    const skillCountRows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(skills)
      .where(eq(skills.organizationId, org.id));

    const recentMemberRows = await this.db
      .select({
        userId: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        jobTitleName: jobTitles.name,
        departmentName: departments.name,
        joinedAt: organizationMemberships.createdAt
      })
      .from(organizationMemberships)
      .innerJoin(users, eq(users.id, organizationMemberships.userId))
      .leftJoin(departments, eq(departments.id, organizationMemberships.departmentId))
      .leftJoin(jobTitles, eq(jobTitles.id, organizationMemberships.jobTitleId))
      .where(
        and(eq(organizationMemberships.organizationId, org.id), isNull(users.deletedAt))
      )
      .orderBy(desc(organizationMemberships.createdAt))
      .limit(6);

    const permissionSet = await effectivePermissions(this.db, this.permissions, org.id, userId);

    const asRoleKey = (key: string): RoleKey =>
      (ROLE_KEYS as readonly string[]).includes(key) ? (key as RoleKey) : "member";

    return {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        logoUrl: org.logoUrl,
        createdAt: org.createdAt.toISOString()
      },
      myMembership: {
        id: membership.membershipId,
        roleKey: asRoleKey(membership.roleKey),
        permissions: [...permissionSet] as OrganizationOverview["myMembership"]["permissions"],
        departmentId: membership.departmentId,
        teamId: membership.teamId,
        jobTitleId: membership.jobTitleId
      },
      stats: {
        members: memberCount?.count ?? 0,
        departments: deptRows.length,
        teams: teamCountRows[0]?.count ?? 0,
        jobTitles: titleCountRows[0]?.count ?? 0,
        skills: skillCountRows[0]?.count ?? 0
      },
      departments: deptRows.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        memberCount: d.memberCount ?? 0
      })),
      recentMembers: recentMemberRows.map((m) => ({
        userId: m.userId,
        name: m.name,
        avatarUrl: m.avatarUrl,
        jobTitleName: m.jobTitleName,
        departmentName: m.departmentName,
        joinedAt: m.joinedAt.toISOString()
      }))
    };
  }

  async update(
    organizationId: string,
    userId: string,
    patch: { name?: string; description?: string | null; logoUrl?: string | null }
  ): Promise<void> {
    await authorize(this.db, this.permissions, organizationId, userId, "organization:update");
    await this.db
      .update(organizations)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(organizations.id, organizationId));
  }
}
