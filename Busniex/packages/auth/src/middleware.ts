import type { Context, Next } from 'hono';
import { verifyAccessToken } from './token';
import { hasPermission, type Identity } from './authorization';
import { Errors } from '@businex/lib';

/**
 * Verify the Bearer token and attach the identity to the Hono context.
 * Rejects requests without a valid token.
 */
export async function requireAuth(c: Context, next: Next): Promise<void> {
  const header = c.req.header('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    throw Errors.unauthorized('Missing Bearer token');
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    const identity: Identity = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      displayName: payload.email,
      roles: [payload.role],
      permissions: payload.role === 'admin' ? ['*'] : [],
    };
    c.set('identity', identity);
    await next();
  } catch {
    throw Errors.unauthorized('Invalid or expired token');
  }
}

export function getIdentity(c: Context): Identity {
  const identity = c.get('identity') as Identity | undefined;
  if (!identity) throw Errors.unauthorized('No identity attached');
  return identity;
}

/**
 * Route guard: requires the given permission on the authenticated identity.
 * Usage: app.use('/invoices', requireAuth, requirePermission('invoice:read'))
 */
export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const identity = getIdentity(c);
    if (!hasPermission(identity, permission)) {
      throw Errors.forbidden(`Missing permission: ${permission}`);
    }
    await next();
  };
}
