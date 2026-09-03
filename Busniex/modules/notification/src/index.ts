import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { getIdentity, requirePermission } from '@businex/auth';
import type { ModuleDescriptor, NotificationType } from '@businex/types';

export interface NotifyInput {
  userId: string;
  title: string;
  body?: string;
  type?: NotificationType;
}

/** Reusable notifier used by any module to push an in-app notification. */
export async function notify(db: BusinexDb, tenantId: string, input: NotifyInput) {
  const [row] = await db
    .insert(tables.notification)
    .values({
      tenantId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type ?? 'info',
    })
    .returning();
  return row;
}

export function notificationRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();
  const identity = (c: Parameters<typeof getIdentity>[0]) => getIdentity(c);

  app.get('/me', requirePermission('notification:read'), async (c) => {
    const me = identity(c);
    const rows = await db
      .select()
      .from(tables.notification)
      .where(and(eq(tables.notification.userId, me.userId), eq(tables.notification.tenantId, me.tenantId)))
      .orderBy(desc(tables.notification.at))
      .limit(50);
    return c.json(rows);
  });

  app.post('/:id/read', requirePermission('notification:read'), async (c) => {
    const me = identity(c);
    const id = c.req.param('id')!;
    const [row] = await db
      .update(tables.notification)
      .set({ readAt: new Date() })
      .where(and(eq(tables.notification.id, id), eq(tables.notification.userId, me.userId)))
      .returning();
    return c.json(row);
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/notifications', notificationRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'notification',
  name: 'Notifications',
  description: 'Universal in-app notification hub shared by every module.',
  group: 'enterprise',
  permissions: ['notification:read'],
  enabled: true,
};
