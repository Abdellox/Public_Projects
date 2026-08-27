import { Hono } from 'hono';
import {
  acceptInvitationSchema,
  loginSchema,
  registerSchema,
} from '@nexora/validation';
import { getDb } from '@nexora/database';
import { clientIp, parseBody } from '../../lib/errors';
import { clearSessionCookie, setSessionCookie } from '../../lib/cookies';
import { writeAudit } from '../../lib/audit';
import { rateLimit } from '../../lib/rate-limit';
import { requireSession, resolveSession } from '../../middleware/session';
import type { AppEnv } from '../../types';
import { acceptInvitation } from '../invitations/invitations.service';
import {
  authenticate,
  createSession,
  listMemberships,
  registerUser,
  revokeSession,
} from './auth.service';

export const authRoutes = new Hono<AppEnv>();

authRoutes.use('*', resolveSession);

const authLimiter = rateLimit({ scope: 'auth', max: 10 });

authRoutes.post('/register', authLimiter, async (c) => {
  const input = await parseBody(c, registerSchema);
  const user = await registerUser(input);
  const token = await createSession(user.id, {
    ip: clientIp(c),
    userAgent: c.req.header('user-agent'),
  });
  setSessionCookie(c, token);
  await writeAudit(getDb(), {
    actorUserId: user.id,
    action: 'auth.register',
    entityType: 'user',
    entityId: user.id,
    ip: clientIp(c),
    userAgent: c.req.header('user-agent'),
  });
  return c.json({ user }, 201);
});

authRoutes.post('/login', authLimiter, async (c) => {
  const input = await parseBody(c, loginSchema);
  const user = await authenticate(input.email, input.password);
  const token = await createSession(user.id, {
    ip: clientIp(c),
    userAgent: c.req.header('user-agent'),
  });
  setSessionCookie(c, token);
  await writeAudit(getDb(), {
    actorUserId: user.id,
    action: 'auth.login',
    entityType: 'user',
    entityId: user.id,
    metadata: { email: input.email },
    ip: clientIp(c),
    userAgent: c.req.header('user-agent'),
  });
  return c.json({ user });
});

authRoutes.post('/logout', async (c) => {
  const session = c.get('session');
  if (session) {
    await revokeSession(session.sessionId);
    await writeAudit(getDb(), {
      actorUserId: session.id,
      action: 'auth.logout',
      entityType: 'user',
      entityId: session.id,
      ip: clientIp(c),
    });
  }
  clearSessionCookie(c);
  return c.json({ ok: true });
});

authRoutes.get('/me', requireSession(), async (c) => {
  const session = c.get('session')!;
  const memberships = await listMemberships(session.id);
  return c.json({
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      avatarUrl: session.avatarUrl,
      jobTitle: session.jobTitle,
    },
    memberships,
  });
});

authRoutes.post('/invitations/accept', requireSession(), authLimiter, async (c) => {
  const session = c.get('session')!;
  const { token } = await parseBody(c, acceptInvitationSchema);
  const result = await acceptInvitation(
    { id: session.id, email: session.email },
    token,
  );
  await writeAudit(getDb(), {
    organizationId: result.organizationId,
    actorUserId: session.id,
    action: 'member.joined',
    entityType: 'membership',
    entityId: result.membershipId,
    ip: clientIp(c),
  });
  return c.json({ membership: result.membership });
});
