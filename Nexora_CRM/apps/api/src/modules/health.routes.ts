import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { getDb } from '@nexora/database';
import type { AppEnv } from '../types';

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get('/', (c) =>
  c.json({ status: 'ok', service: 'nexora-api', time: new Date().toISOString() }),
);

healthRoutes.get('/db', async (c) => {
  try {
    await getDb().execute(sql`select 1`);
    return c.json({ status: 'ok', database: 'up', time: new Date().toISOString() });
  } catch (err) {
    console.error('[health] database check failed:', err);
    return c.json({ status: 'degraded', database: 'down' }, 503);
  }
});
