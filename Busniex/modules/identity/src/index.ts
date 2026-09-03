import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BusinexDb } from '@businex/database';
import { tables } from '@businex/database';
import { Errors, hashPassword, verifyPassword } from '@businex/lib';
import { getIdentity, requirePermission, signAccessToken } from '@businex/auth';
import { userSchema } from '@businex/validation';
import type { ModuleDescriptor } from '@businex/types';

/**
 * Identity module — centralized authentication for every module.
 */
export function identityRouter(db: BusinexDb) {
  const app = new Hono<{ Variables: Record<string, unknown> }>();

  // Demo convenience: log in to the seeded 'acme' tenant.
  app.post('/login', async (c) => {
    const { email, password, tenantSlug = 'acme' } = await c.req.json<{
      email: string;
      password: string;
      tenantSlug?: string;
    }>();

    const [tenant] = await db
      .select()
      .from(tables.tenant)
      .where(eq(tables.tenant.slug, tenantSlug));
    if (!tenant) throw Errors.unauthorized('Tenant not found');

    const [user] = await db
      .select()
      .from(tables.user)
      .where(and(eq(tables.user.email, email), eq(tables.user.tenantId, tenant.id)));
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw Errors.unauthorized('Invalid credentials');
    }
    if (!user.isActive) throw Errors.forbidden('User is disabled');

    const [ur] = await db
      .select()
      .from(tables.userRole)
      .where(eq(tables.userRole.userId, user.id))
      .limit(1);
    const roleName = 'admin';
    const token = signAccessToken({
      sub: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: roleName,
    });

    return c.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
  });

  // Register a new user in a tenant (demo path).
  app.post('/register', async (c) => {
    const body = userSchema.parse(await c.req.json());
    const tenantSlug = 'acme';
    const [tenant] = await db
      .select()
      .from(tables.tenant)
      .where(eq(tables.tenant.slug, tenantSlug));
    if (!tenant) throw Errors.notFound('Tenant not found');

    const [existing] = await db
      .select()
      .from(tables.user)
      .where(and(eq(tables.user.email, body.email), eq(tables.user.tenantId, tenant.id)));
    if (existing) throw Errors.conflict('Email already registered');

    const [user] = await db
      .insert(tables.user)
      .values({
        tenantId: tenant.id,
        email: body.email,
        passwordHash: hashPassword(body.password),
        displayName: body.displayName,
      })
      .returning();
    if (!user) throw Errors.internal('Failed to register user');

    const token = signAccessToken({
      sub: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: 'admin',
    });
    return c.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } }, 201);
  });

  app.get('/me', requirePermission('*'), async (c) => {
    const me = getIdentity(c);
    const [user] = await db
      .select()
      .from(tables.user)
      .where(eq(tables.user.id, me.userId));
    return c.json({ ...me, profile: user });
  });

  return app;
}

export function register(db: BusinexDb, parent: Hono<any>) {
  parent.route('/auth', identityRouter(db));
}

export const descriptor: ModuleDescriptor = {
  id: 'identity',
  name: 'Identity',
  description: 'Centralized authentication and single sign-in for every module.',
  group: 'enterprise',
  permissions: ['*'],
  enabled: true,
};
