import { Hono } from 'hono';
import {
  acceptInvitationSchema,
  createInvitationSchema,
} from '@nexora/validation';
import { getDb } from '@nexora/database';
import { clientIp, parseBody } from '../../lib/errors';
import { writeAudit } from '../../lib/audit';
import { requirePermission } from '../../middleware/organization';
import { requireSession } from '../../middleware/session';
import type { AppEnv } from '../../types';
import {
  acceptInvitation,
  createInvitation,
  listInvitations,
  revokeInvitation,
} from './invitations.service';

export function buildInvitationRoutes() {
  const routes = new Hono<AppEnv>();

  routes.post('/', requirePermission('members.invite'), async (c) => {
    const orgCtx = c.get('org')!;
    const session = c.get('session')!;
    const input = await parseBody(c, createInvitationSchema);

    const { invitation, token } = await createInvitation({
      organizationId: orgCtx.organizationId,
      invitedByUserId: session.id,
      email: input.email,
      roleId: input.roleId,
      departmentId: input.departmentId ?? null,
      teamId: input.teamId ?? null,
    });

    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: session.id,
      action: 'member.invited',
      entityType: 'invitation',
      entityId: invitation.id,
      metadata: { email: invitation.email, roleId: invitation.roleId },
      ip: clientIp(c),
    });

    return c.json({ invitation, token }, 201);
  });

  routes.get(
    '/',
    requirePermission('members.invite'),
    async (c) => {
      const invitations = await listInvitations(c.get('org')!.organizationId);
      return c.json({ invitations });
    },
  );

  routes.delete('/:invitationId', requirePermission('members.invite'), async (c) => {
    const orgCtx = c.get('org')!;
    const invitationId = c.req.param('invitationId');
    await revokeInvitation(orgCtx.organizationId, invitationId);
    await writeAudit(getDb(), {
      organizationId: orgCtx.organizationId,
      actorUserId: c.get('session')!.id,
      action: 'invitation.revoked',
      entityType: 'invitation',
      entityId: invitationId,
      ip: clientIp(c),
    });
    return c.json({ ok: true });
  });

  return routes;
}

export function buildInvitationAcceptRoute() {
  const routes = new Hono<AppEnv>();

  routes.post('/accept', requireSession(), async (c) => {
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

  return routes;
}
