import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { updateNotificationPreferencesSchema } from "@peopleflow/validation";
import { requireCtx } from "../context.js";
import { prisma } from "@peopleflow/database";

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).max(100).optional(),
});

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.get("/notifications", async (request) => {
    const ctx = requireCtx(request);
    const unreadOnly = (request.query as { unread?: string }).unread === "true";
    const rows = await prisma.notification.findMany({
      where: { userId: ctx.userId, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: ctx.userId, readAt: null },
    });
    return { data: rows, unreadCount };
  });

  app.post("/notifications/read", async (request) => {
    const ctx = requireCtx(request);
    const input = markReadSchema.parse(request.body ?? {});
    await prisma.notification.updateMany({
      where: { userId: ctx.userId, ...(input.ids ? { id: { in: input.ids } } : {}) },
      data: { readAt: new Date() },
    });
    return { ok: true };
  });

  app.get("/notification-preferences", async (request) => {
    const ctx = requireCtx(request);
    const rows = await prisma.notificationPreference.findMany({
      where: { userId: ctx.userId },
    });
    return { data: rows };
  });

  app.put("/notification-preferences", async (request) => {
    const ctx = requireCtx(request);
    const input = updateNotificationPreferencesSchema.parse(request.body);
    for (const pref of input.preferences) {
      await prisma.notificationPreference.upsert({
        where: { userId_eventType: { userId: ctx.userId, eventType: pref.eventType } },
        create: {
          userId: ctx.userId,
          eventType: pref.eventType,
          inApp: pref.inApp,
          email: pref.email,
        },
        update: { inApp: pref.inApp, email: pref.email },
      });
    }
    return { ok: true };
  });
}
