import { z } from "zod";
import type { FastifyInstance } from "fastify";
import {
  uuidSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createTeamSchema,
  updateTeamSchema,
  createJobTitleSchema
} from "@nexora/validation";
import { audit } from "../../lib/audit.js";
import { requireUser } from "../../lib/session-cookies.js";
import { StructureService } from "./structure.service.js";

const orgParams = z.object({ organizationId: uuidSchema });
const deptParams = z.object({ departmentId: uuidSchema });
const teamParams = z.object({ teamId: uuidSchema });
const titleParams = z.object({ jobTitleId: uuidSchema });

export async function structureRoutes(app: FastifyInstance): Promise<void> {
  const service = new StructureService(app.db, app.permissions);

  /* ------------------------------- departments ------------------------------ */

  app.get("/organizations/:organizationId/departments", async (request) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    return service.listDepartments(organizationId, session.userId);
  });

  app.post("/organizations/:organizationId/departments", async (request, reply) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    const dto = createDepartmentSchema.parse(request.body);
    const dept = await service.createDepartment(organizationId, session.userId, dto);
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "department.created",
      targetType: "department",
      targetId: dept.id,
      metadata: { name: dept.name },
      request
    });
    reply.code(201).send(dept);
  });

  app.patch("/departments/:departmentId", async (request) => {
    const session = await requireUser(request);
    const { departmentId } = deptParams.parse(request.params);
    const dto = updateDepartmentSchema.parse(request.body);
    return service.updateDepartmentById(session.userId, departmentId, dto);
  });

  app.delete("/departments/:departmentId", async (request) => {
    const session = await requireUser(request);
    const { departmentId } = deptParams.parse(request.params);
    const result = await service.deleteDepartmentById(session.userId, departmentId);
    await audit(app.db, {
      actorUserId: session.userId,
      action: "department.deleted",
      targetType: "department",
      targetId: departmentId,
      request
    });
    return result;
  });

  /* ---------------------------------- teams --------------------------------- */

  app.get("/organizations/:organizationId/teams", async (request) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    const query = z.object({ departmentId: uuidSchema.optional() }).parse(request.query);
    return service.listTeams(organizationId, session.userId, query.departmentId);
  });

  app.post("/organizations/:organizationId/teams", async (request, reply) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    const dto = createTeamSchema.parse(request.body);
    const team = await service.createTeam(organizationId, session.userId, dto);
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "team.created",
      targetType: "team",
      targetId: team.id,
      metadata: { name: team.name },
      request
    });
    reply.code(201).send(team);
  });

  app.patch("/teams/:teamId", async (request) => {
    const session = await requireUser(request);
    const { teamId } = teamParams.parse(request.params);
    const dto = updateTeamSchema.parse(request.body);
    return service.updateTeamById(session.userId, teamId, dto);
  });

  app.delete("/teams/:teamId", async (request) => {
    const session = await requireUser(request);
    const { teamId } = teamParams.parse(request.params);
    const result = await service.deleteTeamById(session.userId, teamId);
    await audit(app.db, {
      actorUserId: session.userId,
      action: "team.deleted",
      targetType: "team",
      targetId: teamId,
      request
    });
    return result;
  });

  /* ------------------------------- job titles ------------------------------- */

  app.get("/organizations/:organizationId/job-titles", async (request) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    return service.listJobTitles(organizationId, session.userId);
  });

  app.post("/organizations/:organizationId/job-titles", async (request, reply) => {
    const session = await requireUser(request);
    const { organizationId } = orgParams.parse(request.params);
    const dto = createJobTitleSchema.parse(request.body);
    const title = await service.createJobTitle(organizationId, session.userId, dto.name);
    await audit(app.db, {
      organizationId,
      actorUserId: session.userId,
      action: "job_title.created",
      targetType: "job_title",
      targetId: title.id,
      metadata: { name: title.name },
      request
    });
    reply.code(201).send(title);
  });

  app.delete("/job-titles/:jobTitleId", async (request) => {
    const session = await requireUser(request);
    const { jobTitleId } = titleParams.parse(request.params);
    return service.deleteJobTitleById(session.userId, jobTitleId);
  });
}
