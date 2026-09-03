import type { FastifyInstance } from "fastify";
import { hasPermission } from "@peopleflow/auth";
import {
  commentSchema,
  createAnnouncementSchema,
  reactSchema,
  updateAnnouncementSchema,
} from "@peopleflow/validation";
import { badRequest, forbidden, notFound, requirePermission } from "../lib/errors.js";
import { requireCtx } from "../context.js";

export async function announcementRoutes(app: FastifyInstance): Promise<void> {
  app.get("/announcements", async (request) => {
    const ctx = requireCtx(request);
    const rows = await ctx.db.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      take: 50,
      include: {
        authorUser: { select: { name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
        reactions: { select: { emoji: true } },
      },
    });

    const visible = (
      await Promise.all(
        rows.map(async (a) => ((await matchesAudience(ctx, a)) ? a : null)),
      )
    ).filter((a): a is NonNullable<typeof a> => Boolean(a));
    return {
      data: visible.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body.length > 400 ? `${a.body.slice(0, 400)}…` : a.body,
        pinned: a.pinned,
        publishedAt: a.publishedAt,
        authorName: a.authorUser.name,
        allowComments: a.allowComments,
        commentCount: a._count.comments,
        reactions: summarizeReactions(a.reactions.map((r) => r.emoji)),
      })),
    };
  });

  app.get("/announcements/:id", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const a = await ctx.db.announcement.findFirst({
      where: { id },
      include: {
        authorUser: { select: { name: true, avatarUrl: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
        reactions: { select: { emoji: true, userId: true } },
      },
    });
    if (!a || !(await matchesAudience(ctx, a))) throw notFound();
    return {
      ...a,
      authorName: a.authorUser.name,
      comments: a.comments.map((c) => ({ id: c.id, body: c.body, createdAt: c.createdAt, userName: c.user.name })),
      reactions: summarizeReactions(a.reactions.map((r) => r.emoji)),
    };
  });

  app.post("/announcements", async (request, reply) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "announcement.publish");
    const input = createAnnouncementSchema.parse(request.body);
    if (input.audience === "DEPARTMENT" && !input.departmentId) {
      throw badRequest("departmentId is required for department announcements");
    }
    if (input.audience === "TEAM" && !input.teamId) {
      throw badRequest("teamId is required for team announcements");
    }
    const row = await ctx.db.announcement.create({
      data: {
        organizationId: ctx.organizationId,
        authorUserId: ctx.userId,
        title: input.title,
        body: input.body,
        audience: input.audience,
        departmentId: input.audience === "DEPARTMENT" ? input.departmentId : null,
        teamId: input.audience === "TEAM" ? input.teamId : null,
        allowComments: input.allowComments,
        pinned: input.pinned,
        publishedAt: new Date(),
      },
    });
    return reply.code(201).send({ id: row.id });
  });

  app.patch("/announcements/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "announcement.publish");
    const { id } = request.params as { id: string };
    const input = updateAnnouncementSchema.parse(request.body);
    const existing = await ctx.db.announcement.findFirst({ where: { id }, select: { id: true } });
    if (!existing) throw notFound();
    return ctx.db.announcement.update({ where: { id: existing.id }, data: input });
  });

  app.delete("/announcements/:id", async (request) => {
    const ctx = requireCtx(request);
    requirePermission(ctx.permissions, "announcement.publish");
    const { id } = request.params as { id: string };
    await ctx.db.announcement.deleteMany({ where: { id } });
    return { ok: true };
  });

  app.post("/announcements/:id/reactions", async (request) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const input = reactSchema.parse(request.body);
    const announcement = await ctx.db.announcement.findFirst({ where: { id }, select: { id: true } });
    if (!announcement) throw notFound();

    const existing = await ctx.db.announcementReaction.findFirst({
      where: { announcementId: id, userId: ctx.userId, emoji: input.emoji },
      select: { id: true },
    });
    if (existing) {
      await ctx.db.announcementReaction.delete({ where: { id: existing.id } });
      return { reacted: false };
    }
    await ctx.db.announcementReaction.create({
      data: { organizationId: ctx.organizationId, announcementId: id, userId: ctx.userId, emoji: input.emoji },
    });
    return { reacted: true };
  });

  app.post("/announcements/:id/comments", async (request, reply) => {
    const ctx = requireCtx(request);
    const { id } = request.params as { id: string };
    const input = commentSchema.parse(request.body);
    const announcement = await ctx.db.announcement.findFirst({
      where: { id },
      select: { allowComments: true },
    });
    if (!announcement) throw notFound();
    if (!announcement.allowComments) throw forbidden("Comments are disabled for this announcement");
    const comment = await ctx.db.announcementComment.create({
      data: { organizationId: ctx.organizationId, announcementId: id, userId: ctx.userId, body: input.body },
    });
    return reply.code(201).send({ id: comment.id });
  });
}

async function matchesAudience(
  ctx: { employeeId: string | null; db: Awaited<ReturnType<typeof requireCtx>["db"]> },
  announcement: { audience: string; departmentId: string | null; teamId: string | null },
): Promise<boolean> {
  if (announcement.audience === "ALL") return true;
  if (!ctx.employeeId) return false;
  const employee = await ctx.db.employee.findFirst({
    where: { id: ctx.employeeId },
    select: { departmentId: true, teamId: true },
  });
  if (!employee) return false;
  if (announcement.audience === "DEPARTMENT") {
    return announcement.departmentId !== null && announcement.departmentId === employee.departmentId;
  }
  if (announcement.audience === "TEAM") {
    return announcement.teamId !== null && announcement.teamId === employee.teamId;
  }
  return false;
}

function summarizeReactions(emojis: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const e of emojis) summary[e] = (summary[e] ?? 0) + 1;
  return summary;
}
