import { z } from "zod";
import { isoDate } from "./common.js";

// ── Announcements ────────────────────────────────────────────────────────────

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
  audience: z.enum(["ALL", "DEPARTMENT", "TEAM"]).default("ALL"),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  allowComments: z.boolean().default(true),
  pinned: z.boolean().default(false),
  publishAt: isoDate.optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const reactSchema = z.object({
  emoji: z.enum(["👍", "🎉", "❤️", "👀"]),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

// ── Notifications ────────────────────────────────────────────────────────────

export const updateNotificationPreferencesSchema = z.object({
  preferences: z
    .array(
      z.object({
        eventType: z.string().max(60),
        inApp: z.boolean(),
        email: z.boolean(),
      }),
    )
    .max(50),
});

// ── AI assistant ─────────────────────────────────────────────────────────────

export const aiChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});
