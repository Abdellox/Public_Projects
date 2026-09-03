import type { FastifyInstance } from "fastify";
import type { Prisma, ApplicationStage } from "@prisma/client";
import {
  createApplicationSchema,
  createCandidateSchema,
  createJobOpeningSchema,
  moveApplicationSchema,
  scheduleInterviewSchema,
  submitInterviewFeedbackSchema,
  updateJobOpeningSchema,
} from "@peopleflow/validation";
import { badRequest, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";

export async function recruitmentRoutes(app: FastifyInstance): Promise<void> {
  // ── Job openings ───────────────────────────────────────────────────────────
  app.get("/jobs", async (request) => {
    const ctx = requireCtx(request);
    const status = (request.query as { status?: string }).status;
    const where: Prisma.JobOpeningWhereInput = {};
    if (status) where.status = status as Prisma.EnumJobOpeningStatusFilter["equals"];
    const rows = await ctx.db.jobOpening.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
    });
    return { data: rows };
  });

  app.post("/jobs", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const input = createJobOpeningSchema.parse(request.body);
    const row = await ctx.db.jobOpening.create({ data: { ...input, organizationId: ctx.organizationId } });
    return reply.code(201).send(row);
  });

  app.patch("/jobs/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const { id } = request.params as { id: string };
    const input = updateJobOpeningSchema.parse(request.body);
    const existing = await ctx.db.jobOpening.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    return ctx.db.jobOpening.update({ where: { id: existing.id }, data: input });
  });

  app.delete("/jobs/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const { id } = request.params as { id: string };
    await ctx.db.jobOpening.updateMany({
      where: { id },
      data: { status: "CLOSED" },
    });
    return { ok: true };
  });

  // ── Candidates ─────────────────────────────────────────────────────────────
  app.get("/candidates", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const q = (request.query as { q?: string }).q;
    const like = q ? { contains: q, mode: "insensitive" as const } : undefined;
    const rows = await ctx.db.candidate.findMany({
      where: like ? { OR: [{ firstName: like }, { lastName: like }, { email: like }] } : undefined,
      orderBy: { lastName: "asc" },
      take: 100,
      include: { applications: { select: { id: true, stage: true, job: { select: { title: true } } } } },
    });
    return { data: rows };
  });

  app.post("/candidates", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const input = createCandidateSchema.parse(request.body);
    const existing = await ctx.db.candidate.findFirst({ where: { email: input.email }, select: { id: true } });
    if (existing) {
      return reply.code(200).send({ id: existing.id, existing: true });
    }
    const row = await ctx.db.candidate.create({ data: { ...input, organizationId: ctx.organizationId } });
    return reply.code(201).send(row);
  });

  // ── Applications & pipeline ────────────────────────────────────────────────
  app.get("/applications", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const jobId = (request.query as { jobId?: string }).jobId;
    const rows = await ctx.db.application.findMany({
      where: jobId ? { jobId } : undefined,
      orderBy: [{ stage: "asc" }, { appliedAt: "desc" }],
      take: 200,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        job: { select: { id: true, title: true } },
      },
    });

    const stages: ApplicationStage[] = ["APPLIED", "SCREENING", "INTERVIEW", "FINAL_INTERVIEW", "OFFER", "HIRED", "REJECTED"];
    const pipeline = stages.map((stage) => ({
      stage,
      applications: rows.filter((r) => r.stage === stage).map((r) => ({
        id: r.id,
        candidateName: `${r.candidate.firstName} ${r.candidate.lastName}`,
        candidateEmail: r.candidate.email,
        jobTitle: r.job.title,
        appliedAt: r.appliedAt,
        rating: r.rating,
      })),
    }));
    return { data: rows, pipeline };
  });

  app.post("/applications", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const input = createApplicationSchema.parse(request.body);

    const job = await ctx.db.jobOpening.findFirst({ where: { id: input.jobId }, select: { id: true, status: true } });
    if (!job) throw badRequest("Job not found in this organization");
    const candidate = await ctx.db.candidate.findFirst({ where: { id: input.candidateId }, select: { id: true } });
    if (!candidate) throw badRequest("Candidate not found in this organization");

    const application = await ctx.db.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          organizationId: ctx.organizationId,
          jobId: job.id,
          candidateId: candidate.id,
          stage: input.stage,
          note: input.note ?? null,
        },
      });
      await tx.applicationStageHistory.create({
        data: { applicationId: created.id, stage: input.stage },
      });
      return created;
    });
    return reply.code(201).send(application);
  });

  app.post("/applications/:id/move", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const { id } = request.params as { id: string };
    const input = moveApplicationSchema.parse(request.body);

    const application = await ctx.db.application.findFirst({ where: { id }, select: { id: true, note: true } });
    if (!application) throw notFound();

    await ctx.db.application.update({
      where: { id: application.id },
      data: { stage: input.stage, note: input.note ?? application.note ?? null },
    });
    await ctx.db.applicationStageHistory.create({
      data: { applicationId: application.id, stage: input.stage },
    });
    return { ok: true };
  });

  // ── Interviews ─────────────────────────────────────────────────────────────
  app.get("/interviews", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const rows = await ctx.db.interview.findMany({
      orderBy: { scheduledAt: "asc" },
      take: 100,
      include: {
        application: {
          select: {
            id: true,
            candidate: { select: { firstName: true, lastName: true } },
            job: { select: { title: true } },
          },
        },
        feedbackList: { select: { interviewerUserId: true, recommendation: true } },
      },
    });
    return { data: rows };
  });

  app.post("/applications/:id/interviews", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const { id } = request.params as { id: string };
    const input = scheduleInterviewSchema.parse(request.body);

    for (const interviewerUserId of input.interviewerUserIds) {
      const membership = await ctx.db.membership.findFirst({
        where: { userId: interviewerUserId },
        select: { id: true },
      });
      if (!membership) throw badRequest("An interviewer is not a member of this organization");
    }

    const row = await ctx.db.interview.create({
      data: {
        organizationId: ctx.organizationId,
        applicationId: id,
        scheduledAt: new Date(`${input.scheduledAt}T00:00:00.000Z`),
        durationMinutes: input.durationMinutes,
        meetingLink: input.meetingLink ?? null,
        notes: input.notes ?? null,
      },
    });
    return reply.code(201).send(row);
  });

  app.post("/interviews/:id/feedback", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "recruitment.manage");
    const { id } = request.params as { id: string };
    const input = submitInterviewFeedbackSchema.parse(request.body);

    const interview = await ctx.db.interview.findFirst({
      where: { id },
      select: { id: true },
    });
    if (!interview) throw notFound();

    const feedback = await ctx.db.interviewFeedback.upsert({
      where: { interviewId_interviewerUserId: { interviewId: interview.id, interviewerUserId: ctx.userId } },
      create: {
        organizationId: ctx.organizationId,
        interviewId: interview.id,
        interviewerUserId: ctx.userId,
        recommendation: input.recommendation,
        rating: input.rating ?? null,
        notes: input.notes,
      },
      update: { recommendation: input.recommendation, rating: input.rating ?? null, notes: input.notes },
    });
    return feedback;
  });
}
