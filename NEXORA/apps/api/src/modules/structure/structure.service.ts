import { and, asc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@nexora/database";
import {
  departments,
  jobTitles,
  organizationMemberships,
  teams,
  users
} from "@nexora/database";
import { badRequest, conflict, notFound } from "@nexora/types";
import type { PermissionCache } from "../../policy/policy.js";
import { authorize } from "../../policy/policy.js";
import { slugify } from "../organizations/organizations.service.js";

/** Resolves a department within an organization or throws 404. */
async function departmentOr404(db: Db, organizationId: string, departmentId: string) {
  const rows = await db
    .select()
    .from(departments)
    .where(
      and(
        eq(departments.id, departmentId),
        eq(departments.organizationId, organizationId),
        isNull(departments.deletedAt)
      )
    )
    .limit(1);
  const dept = rows[0];
  if (!dept) throw notFound("Department not found");
  return dept;
}

export class StructureService {
  constructor(
    private readonly db: Db,
    private readonly permissions: PermissionCache
  ) {}

  /* ------------------------------- departments ------------------------------ */

  async listDepartments(organizationId: string, userId: string) {
    await authorize(this.db, this.permissions, organizationId, userId, "member:view");
    const rows = await this.db
      .select({
        id: departments.id,
        name: departments.name,
        slug: departments.slug,
        description: departments.description,
        color: departments.color,
        memberCount: sql<number>`count(distinct ${organizationMemberships.id})::int`,
        teamCount: sql<number>`0`
      })
      .from(departments)
      .leftJoin(
        organizationMemberships,
        and(
          eq(organizationMemberships.departmentId, departments.id),
          eq(organizationMemberships.status, "active")
        )
      )
      .where(and(eq(departments.organizationId, organizationId), isNull(departments.deletedAt)))
      .groupBy(departments.id)
      .orderBy(asc(departments.name));

    const teamCounts = await this.db
      .select({
        departmentId: teams.departmentId,
        count: sql<number>`count(*)::int`
      })
      .from(teams)
      .where(and(isNull(teams.deletedAt)))
      .groupBy(teams.departmentId);

    return rows.map((r) => ({
      ...r,
      teamCount: teamCounts.find((t) => t.departmentId === r.id)?.count ?? 0
    }));
  }

  async createDepartment(
    organizationId: string,
    userId: string,
    input: { name: string; slug?: string; description?: string | null; color: string }
  ) {
    await authorize(this.db, this.permissions, organizationId, userId, "department:create");

    const slug = slugify(input.slug ?? input.name).slice(0, 48);
    if (!slug) throw badRequest("Name must contain letters or numbers");
    const existing = await this.db
      .select({ id: departments.id })
      .from(departments)
      .where(and(eq(departments.organizationId, organizationId), eq(departments.slug, slug)))
      .limit(1);
    if (existing.length > 0) {
      throw conflict("SLUG_TAKEN", "A department with this slug already exists");
    }

    const inserted = await this.db
      .insert(departments)
      .values({
        organizationId,
        name: input.name,
        slug,
        description: input.description ?? null,
        color: input.color,
        createdBy: userId
      })
      .returning();
    const dept = inserted[0];
    if (!dept) throw new Error("department_insert_returned_no_rows");
    return dept;
  }

  async updateDepartment(
    organizationId: string,
    userId: string,
    departmentId: string,
    patch: { name?: string; description?: string | null; color?: string }
  ) {
    await authorize(this.db, this.permissions, organizationId, userId, "department:update");
    await departmentOr404(this.db, organizationId, departmentId);
    await this.db
      .update(departments)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(departments.id, departmentId));
    return { ok: true };
  }

  /** Soft delete — refuses while active teams remain attached. */
  async deleteDepartment(organizationId: string, userId: string, departmentId: string) {
    await authorize(this.db, this.permissions, organizationId, userId, "department:delete");
    await departmentOr404(this.db, organizationId, departmentId);

    const teamCount = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(teams)
      .where(and(eq(teams.departmentId, departmentId), isNull(teams.deletedAt)));
    if ((teamCount[0]?.count ?? 0) > 0) {
      throw conflict(
        "DEPARTMENT_HAS_TEAMS",
        "Move or delete the teams in this department first"
      );
    }

    await this.db
      .update(departments)
      .set({ deletedAt: new Date() })
      .where(eq(departments.id, departmentId));
    return { ok: true };
  }

  /** Resolves a resource id to its owning organization, then authorizes inside it. */
  async updateDepartmentById(userId: string, departmentId: string, patch: { name?: string; description?: string | null; color?: string }) {
    const deptRows = await this.db
      .select({ id: departments.id, organizationId: departments.organizationId })
      .from(departments)
      .where(and(eq(departments.id, departmentId), isNull(departments.deletedAt)))
      .limit(1);
    const dept = deptRows[0];
    if (!dept) throw notFound("Department not found");
    return this.updateDepartment(dept.organizationId, userId, departmentId, patch);
  }

  async deleteDepartmentById(userId: string, departmentId: string) {
    const deptRows = await this.db
      .select({ id: departments.id, organizationId: departments.organizationId })
      .from(departments)
      .where(and(eq(departments.id, departmentId), isNull(departments.deletedAt)))
      .limit(1);
    const dept = deptRows[0];
    if (!dept) throw notFound("Department not found");
    return this.deleteDepartment(dept.organizationId, userId, departmentId);
  }

  /* ---------------------------------- teams --------------------------------- */

  async listTeams(organizationId: string, userId: string, departmentId?: string) {
    await authorize(this.db, this.permissions, organizationId, userId, "member:view");
    const predicates = [eq(teams.organizationId, organizationId), isNull(teams.deletedAt)];
    if (departmentId) predicates.push(eq(teams.departmentId, departmentId));

    const rows = await this.db
      .select({
        id: teams.id,
        organizationId: teams.organizationId,
        departmentId: teams.departmentId,
        name: teams.name,
        slug: teams.slug,
        description: teams.description,
        createdAt: teams.createdAt,
        memberCount: sql<number>`count(${organizationMemberships.id})::int`
      })
      .from(teams)
      .leftJoin(
        organizationMemberships,
        and(
          eq(organizationMemberships.teamId, teams.id),
          eq(organizationMemberships.status, "active")
        )
      )
      .where(and(...predicates))
      .groupBy(teams.id)
      .orderBy(asc(teams.name))
      .limit(200);

    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  }

  async createTeam(
    organizationId: string,
    userId: string,
    input: {
      departmentId: string;
      name: string;
      slug?: string;
      description?: string | null;
    }
  ) {
    await authorize(this.db, this.permissions, organizationId, userId, "team:create");
    const dept = await departmentOr404(this.db, organizationId, input.departmentId);

    const slug = slugify(input.slug ?? input.name).slice(0, 48);
    if (!slug) throw badRequest("Name must contain letters or numbers");
    const existing = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.departmentId, dept.id), eq(teams.slug, slug), isNull(teams.deletedAt)))
      .limit(1);
    if (existing.length > 0) {
      throw conflict("SLUG_TAKEN", "A team with this slug already exists in this department");
    }

    const inserted = await this.db
      .insert(teams)
      .values({
        organizationId,
        departmentId: dept.id,
        name: input.name,
        slug,
        description: input.description ?? null,
        createdBy: userId
      })
      .returning();
    const team = inserted[0];
    if (!team) throw new Error("team_insert_returned_no_rows");
    return team;
  }

  async updateTeam(
    organizationId: string,
    userId: string,
    teamId: string,
    patch: { name?: string; description?: string | null }
  ) {
    await authorize(this.db, this.permissions, organizationId, userId, "team:update");
    const rows = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.id, teamId), eq(teams.organizationId, organizationId), isNull(teams.deletedAt)))
      .limit(1);
    if (rows.length === 0) throw notFound("Team not found");

    await this.db
      .update(teams)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(teams.id, teamId));
    return { ok: true };
  }

  async deleteTeam(organizationId: string, userId: string, teamId: string) {
    await authorize(this.db, this.permissions, organizationId, userId, "team:delete");
    const rows = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.id, teamId), eq(teams.organizationId, organizationId), isNull(teams.deletedAt)))
      .limit(1);
    if (rows.length === 0) throw notFound("Team not found");

    const memberCount = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMemberships)
      .innerJoin(users, eq(users.id, organizationMemberships.userId))
      .where(and(eq(organizationMemberships.teamId, teamId), isNull(users.deletedAt)));
    if ((memberCount[0]?.count ?? 0) > 0) {
      throw conflict("TEAM_HAS_MEMBERS", "Reassign members before deleting this team");
    }

    await this.db.update(teams).set({ deletedAt: new Date() }).where(eq(teams.id, teamId));
    return { ok: true };
  }

  async updateTeamById(userId: string, teamId: string, patch: { name?: string; description?: string | null }) {
    const rows = await this.db
      .select({ id: teams.id, organizationId: teams.organizationId })
      .from(teams)
      .where(and(eq(teams.id, teamId), isNull(teams.deletedAt)))
      .limit(1);
    const team = rows[0];
    if (!team) throw notFound("Team not found");
    return this.updateTeam(team.organizationId, userId, teamId, patch);
  }

  async deleteTeamById(userId: string, teamId: string) {
    const rows = await this.db
      .select({ id: teams.id, organizationId: teams.organizationId })
      .from(teams)
      .where(and(eq(teams.id, teamId), isNull(teams.deletedAt)))
      .limit(1);
    const team = rows[0];
    if (!team) throw notFound("Team not found");
    return this.deleteTeam(team.organizationId, userId, teamId);
  }

  /* ------------------------------- job titles ------------------------------- */

  async listJobTitles(organizationId: string, userId: string) {
    await authorize(this.db, this.permissions, organizationId, userId, "member:view");
    return this.db
      .select({
        id: jobTitles.id,
        organizationId: jobTitles.organizationId,
        name: jobTitles.name,
        usageCount: sql<number>`(
          select count(*)::int from ${organizationMemberships}
          where ${organizationMemberships.jobTitleId} = ${jobTitles.id}
        )`
      })
      .from(jobTitles)
      .where(eq(jobTitles.organizationId, organizationId))
      .orderBy(asc(jobTitles.name));
  }

  async createJobTitle(organizationId: string, userId: string, name: string) {
    await authorize(this.db, this.permissions, organizationId, userId, "jobtitle:manage");
    const norm = name.trim().toLowerCase();
    const existing = await this.db
      .select({ id: jobTitles.id })
      .from(jobTitles)
      .where(and(eq(jobTitles.organizationId, organizationId), eq(jobTitles.nameNorm, norm)))
      .limit(1);
    if (existing.length > 0) throw conflict("NAME_TAKEN", "This job title already exists");

    const inserted = await this.db
      .insert(jobTitles)
      .values({ organizationId, name: name.trim(), nameNorm: norm, createdBy: userId })
      .returning();
    const title = inserted[0];
    if (!title) throw new Error("job_title_insert_returned_no_rows");
    return title;
  }

  async deleteJobTitle(organizationId: string, userId: string, jobTitleId: string) {
    await authorize(this.db, this.permissions, organizationId, userId, "jobtitle:manage");
    const usageRows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMemberships)
      .where(eq(organizationMemberships.jobTitleId, jobTitleId));
    if ((usageRows[0]?.count ?? 0) > 0) {
      throw conflict("TITLE_IN_USE", "Reassign members before deleting this job title");
    }
    await this.db
      .delete(jobTitles)
      .where(and(eq(jobTitles.id, jobTitleId), eq(jobTitles.organizationId, organizationId)));
    return { ok: true };
  }

  async deleteJobTitleById(userId: string, jobTitleId: string) {
    const rows = await this.db
      .select({ id: jobTitles.id, organizationId: jobTitles.organizationId })
      .from(jobTitles)
      .where(eq(jobTitles.id, jobTitleId))
      .limit(1);
    const title = rows[0];
    if (!title) throw notFound("Job title not found");
    return this.deleteJobTitle(title.organizationId, userId, jobTitleId);
  }
}
