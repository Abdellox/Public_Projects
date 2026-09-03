import { db } from "@/lib/db";
import { NotificationType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  return db.notification.create({ data: { userId, type, title, message, link } });
}

export async function getNotifications(userId: string, unreadOnly = false) {
  return db.notification.findMany({
    where: { userId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markAsRead(id: string) {
  return db.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({ where: { userId, read: false } });
}
