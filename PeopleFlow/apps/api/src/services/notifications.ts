import { prisma, type ScopedDb } from "@peopleflow/database";

export const NOTIFICATION_EVENTS = {
  LEAVE_REQUESTED: { label: "Leave request submitted", defaultInApp: true, defaultManagerFor: "approver" },
  LEAVE_DECIDED: { label: "Leave request decision", defaultInApp: true },
  TASK_ASSIGNED: { label: "Task assigned", defaultInApp: true },
  TRAINING_ASSIGNED: { label: "Training assigned", defaultInApp: true },
  DOCUMENT_EXPIRING: { label: "Document expiring", defaultInApp: true },
  ANNOUNCEMENT_PUBLISHED: { label: "Company announcement", defaultInApp: true },
  APPROVAL_REMINDER: { label: "Approval waiting for you", defaultInApp: true },
} as const;

export type NotificationEventType = keyof typeof NOTIFICATION_EVENTS;

export interface NotifyInput {
  userIds: string[];
  type: NotificationEventType;
  title: string;
  body?: string;
  link?: string;
}

export async function notifyMany(input: NotifyInput): Promise<void> {
  if (input.userIds.length === 0) return;
  const unique = [...new Set(input.userIds)];
  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: { in: unique }, eventType: input.type },
  });
  const enabled = new Set(
    prefs.filter((p) => p.inApp).map((p) => p.userId),
  );
  const recipients = prefs.length > 0 ? unique.filter((id) => enabled.has(id)) : unique;
  if (recipients.length === 0) return;
  await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    })),
  });
}

/** Resolve the HR-ish recipients of an organization (members holding a permission). */
export async function usersWithPermission(db: ScopedDb, organizationId: string, permission: string): Promise<string[]> {
  const memberships = await db.membership.findMany({
    where: {
      role: { permissions: { has: "*" } },
    },
    select: { userId: true, role: { select: { permissions: true } } },
  });
  const exact = await db.membership.findMany({
    where: { role: { permissions: { has: permission } } },
    select: { userId: true },
  });
  const ids = new Set<string>([...exact.map((m) => m.userId), ...memberships.map((m) => m.userId)]);
  return [...ids];
}
