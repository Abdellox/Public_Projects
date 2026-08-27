import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { DbExecutor } from "@nexora/database";
import {
  departments,
  jobTitles,
  organizationMemberships,
  skills,
  teams,
  userSkills,
  users
} from "@nexora/database";
import { badRequest } from "@nexora/types";
import {
  uuidSchema,
  updateProfileSchema,
  updateSelfMembershipSchema,
  replaceSkillsSchema
} from "@nexora/validation";
import { requireUser } from "../../lib/session-cookies.js";
import { MembersService } from "../members/members.service.js";

const membershipParams = z.object({ membershipId: uuidSchema });

export async function meRoutes(app: FastifyInstance): Promise<void> {
  const membersService = new MembersService(app.db, app.permissions);

  app.patch("/profile", async (request) => {
    const session = await requireUser(request);
    const dto = updateProfileSchema.parse(request.body);
    await app.db
      .update(users)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(users.id, session.userId));
    return { ok: true };
  });

  /**
   * Self-service placement: every active member may position themselves in
   * the org chart. Referenced entities are validated to belong to the same
   * organization — cross-org ids are rejected.
   */
  app.patch("/memberships/:membershipId", async (request) => {
    const session = await requireUser(request);
    const { membershipId } = membershipParams.parse(request.params);
    const dto = updateSelfMembershipSchema.parse(request.body);

    const own = await membersService.ownMembership(session.userId, membershipId);
    await validatePlacement(app.db, own.organizationId, dto);

    await app.db
      .update(organizationMemberships)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(organizationMemberships.id, membershipId));

    return { ok: true };
  });

  /** The caller's own placement details and skill set for one organization. */
  app.get("/memberships/:membershipId", async (request) => {
    const session = await requireUser(request);
    const { membershipId } = membershipParams.parse(request.params);
    const own = await membersService.ownMembership(session.userId, membershipId);

    const placementRows = await app.db
      .select({
        departmentId: organizationMemberships.departmentId,
        teamId: organizationMemberships.teamId,
        jobTitleId: organizationMemberships.jobTitleId
      })
      .from(organizationMemberships)
      .where(eq(organizationMemberships.id, membershipId))
      .limit(1);

    const skillRows = await app.db
      .select({ name: skills.name, level: userSkills.level })
      .from(userSkills)
      .innerJoin(skills, eq(skills.id, userSkills.skillId))
      .where(
        and(eq(userSkills.userId, session.userId), eq(userSkills.organizationId, own.organizationId))
      );

    const row = placementRows[0];
    if (!row) throw badRequest("Membership not found");
    return { ...row, skills: skillRows };
  });

  /** Replaces the caller's skill set within one organization atomically. */
  app.put("/memberships/:membershipId/skills", async (request) => {    const session = await requireUser(request);
    const { membershipId } = membershipParams.parse(request.params);
    const dto = replaceSkillsSchema.parse(request.body);

    const own = await membersService.ownMembership(session.userId, membershipId);
    const organizationId = own.organizationId;

    const count = await app.db.transaction(async (tx) => {
      const resolvedIds: string[] = [];
      for (const s of dto.skills) {
        const norm = s.name.toLowerCase();
        const rows = await tx
          .insert(skills)
          .values({
            organizationId,
            name: s.name,
            nameNorm: norm,
            createdBy: session.userId
          })
          .onConflictDoUpdate({
            target: [skills.organizationId, skills.nameNorm],
            set: { name: s.name }
          })
          .returning({ id: skills.id });
        const row = rows[0];
        if (!row) throw new Error("skill_upsert_returned_no_rows");
        resolvedIds.push(row.id);
      }

      // Reconcile: wipe this user's org-scoped skills, then insert the new set.
      await tx
        .delete(userSkills)
        .where(
          and(eq(userSkills.userId, session.userId), eq(userSkills.organizationId, organizationId))
        );

      if (resolvedIds.length > 0) {
        await tx.insert(userSkills).values(
          resolvedIds.map((skillId, i) => ({
            userId: session.userId,
            skillId,
            organizationId,
            level: dto.skills[i]?.level ?? ("intermediate" as const)
          }))
        );
      }

      return resolvedIds.length;
    });

    return { ok: true, count };
  });
}

async function validatePlacement(
  db: DbExecutor,
  organizationId: string,
  dto: { departmentId?: string | null; teamId?: string | null; jobTitleId?: string | null }
): Promise<void> {
  if (dto.departmentId) {
    const rows = await db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          eq(departments.id, dto.departmentId),
          eq(departments.organizationId, organizationId),
          isNull(departments.deletedAt)
        )
      )
      .limit(1);
    if (rows.length === 0) throw badRequest("Department does not belong to this organization");
  }
  if (dto.jobTitleId) {
    const rows = await db
      .select({ id: jobTitles.id })
      .from(jobTitles)
      .where(and(eq(jobTitles.id, dto.jobTitleId), eq(jobTitles.organizationId, organizationId)))
      .limit(1);
    if (rows.length === 0) throw badRequest("Job title does not belong to this organization");
  }
  if (dto.teamId) {
    const rows = await db
      .select({ departmentId: teams.departmentId })
      .from(teams)
      .where(and(eq(teams.id, dto.teamId), eq(teams.organizationId, organizationId)))
      .limit(1);
    const team = rows[0];
    if (!team) throw badRequest("Team does not belong to this organization");
    if (dto.departmentId && team.departmentId !== dto.departmentId) {
      throw badRequest("Team belongs to a different department");
    }
  }
}
