import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

/**
 * Full multi-tenant integration flow against a real PostgreSQL.
 * Skipped automatically when DATABASE_URL is not set (e.g. unit-only runs).
 * Self-cleans: every record uses a unique suffix and is deleted afterwards.
 */

const RUN = process.env.DATABASE_URL ? describe : describe.skip;

const SUFFIX = randomUUID().slice(0, 8);
const OWNER_EMAIL = `owner-${SUFFIX}@integration.test`;
const MEMBER_EMAIL = `member-${SUFFIX}@integration.test`;
const OUTSIDER_EMAIL = `outsider-${SUFFIX}@integration.test`;
const PASSWORD = 'Integration1!';

let app!: Awaited<ReturnType<typeof import('../../src/app').createApp>>;
let ownerCookie = '';
let memberCookie = '';
let outsiderCookie = '';

let orgAId = '';
let orgASlug = '';
let orgCId = '';
let memberMembershipId = '';

function captureCookie(headers: Headers): void {
  const setCookie = headers.get('set-cookie');
  if (!setCookie) return;
  const pair = setCookie.split(';')[0]!;
  if (pair.includes('owner-')) ownerCookie = pair;
  else if (pair.includes('member-')) memberCookie = pair;
  else if (pair.includes('outsider-')) outsiderCookie = pair;
}

async function call(
  method: string,
  path: string,
  opts: { cookie?: string; body?: unknown } = {},
): Promise<Response> {
  return app.request(path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(opts.cookie ? { cookie: opts.cookie } : {}),
    },
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });
}

RUN('multi-tenant foundation flow', () => {
  beforeAll(async () => {
    const { createApp } = await import('../../src/app');
    app = createApp();
  });

  afterAll(async () => {
    const [{ eq, inArray }, dbModule] = await Promise.all([
      import('drizzle-orm'),
      import('@nexora/database'),
    ]);
    if (!orgAId && !orgCId) return;
    const orgIds = [orgAId, orgCId].filter(Boolean);

    await dbModule
      .getDb()
      .delete(dbModule.auditLogs)
      .where(inArray(dbModule.auditLogs.organizationId, orgIds));
    await dbModule
      .getDb()
      .delete(dbModule.organizations)
      .where(
        orgIds.length > 1
          ? inArray(dbModule.organizations.id, orgIds)
          : eq(dbModule.organizations.id, orgIds[0]!),
      );
    await dbModule
      .getDb()
      .delete(dbModule.users)
      .where(
        inArray(dbModule.users.email, [OWNER_EMAIL, MEMBER_EMAIL, OUTSIDER_EMAIL]),
      );
  });

  it('registers three users', async () => {
    for (const email of [OWNER_EMAIL, MEMBER_EMAIL, OUTSIDER_EMAIL]) {
      const res = await call('POST', '/v1/auth/register', {
        body: { name: 'Test User', email, password: PASSWORD },
      });
      expect(res.status).toBe(201);
      captureCookie(res.headers);
    }
    expect(ownerCookie).toContain('nx_session=');
    expect(memberCookie).toContain('nx_session=');
    expect(outsiderCookie).toContain('nx_session=');
  });

  it('rejects duplicate registration', async () => {
    const res = await call('POST', '/v1/auth/register', {
      body: { name: 'Dup', email: OWNER_EMAIL, password: PASSWORD },
    });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe(
      'CONFLICT',
    );
  });

  it('creates organization A with seeded roles and owner membership', async () => {
    orgASlug = `org-a-${SUFFIX}`;
    const res = await call('POST', '/v1/organizations', {
      cookie: ownerCookie,
      body: { name: 'Org A', slug: orgASlug },
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { organization: { id: string } };
    orgAId = body.organization.id;
    expect(orgAId).toBeTruthy();
  });

  it('me returns the owner membership for user A', async () => {
    const res = await call('GET', '/v1/auth/me', { cookie: ownerCookie });
    expect(res.status).toBe(200);
    const me = (await res.json()) as {
      memberships: { organizationId: string; roleKey: string }[];
    };
    expect(me.memberships).toHaveLength(1);
    expect(me.memberships[0]!.roleKey).toBe('owner');
  });

  it('rejects login with wrong password', async () => {
    const res = await call('POST', '/v1/auth/login', {
      body: { email: OWNER_EMAIL, password: 'WrongPass123!' },
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('invites member B and accepts the invitation', async () => {
    const rolesRes = await call('GET', `/v1/organizations/${orgAId}/roles`, {
      cookie: ownerCookie,
    });
    const { roles } = (await rolesRes.json()) as {
      roles: { id: string; key: string }[];
    };
    const memberRole = roles.find((r) => r.key === 'member')!;

    const inviteRes = await call(
      'POST',
      `/v1/organizations/${orgAId}/invitations`,
      {
        cookie: ownerCookie,
        body: { email: MEMBER_EMAIL, roleId: memberRole.id },
      },
    );
    expect(inviteRes.status).toBe(201);
    const { token } = (await inviteRes.json()) as { token: string };

    const acceptRes = await call('POST', '/v1/invitations/accept', {
      cookie: memberCookie,
      body: { token },
    });
    expect(acceptRes.status).toBe(200);
  });

  it('forbids inviting directly into the owner role', async () => {
    const rolesRes = await call('GET', `/v1/organizations/${orgAId}/roles`, {
      cookie: ownerCookie,
    });
    const { roles } = (await rolesRes.json()) as {
      roles: { id: string; key: string }[];
    };
    const ownerRole = roles.find((r) => r.key === 'owner')!;

    const res = await call('POST', `/v1/organizations/${orgAId}/invitations`, {
      cookie: ownerCookie,
      body: { email: `x-${SUFFIX}@integration.test`, roleId: ownerRole.id },
    });
    expect(res.status).toBe(400);
  });

  it('member B cannot invite or manage (RBAC)', async () => {
    const rolesRes = await call('GET', `/v1/organizations/${orgAId}/roles`, {
      cookie: ownerCookie,
    });
    const { roles } = (await rolesRes.json()) as {
      roles: { id: string }[];
    };

    const inviteRes = await call(
      'POST',
      `/v1/organizations/${orgAId}/invitations`,
      {
        cookie: memberCookie,
        body: { email: `y-${SUFFIX}@integration.test`, roleId: roles[0]!.id },
      },
    );
    expect([inviteRes.status]).toContain(403);

    const deptRes = await call('POST', `/v1/organizations/${orgAId}/departments`, {
      cookie: memberCookie,
      body: { name: 'Forbidden Dept' },
    });
    expect(deptRes.status).toBe(403);
  });

  it('creates organization C for the outsider', async () => {
    const res = await call('POST', '/v1/organizations', {
      cookie: outsiderCookie,
      body: { name: 'Org C' },
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { organization: { id: string } };
    orgCId = body.organization.id;
  });

  it('tenant isolation: outsider gets 404 on org A resources', async () => {
    const membersRes = await call('GET', `/v1/organizations/${orgAId}/members`, {
      cookie: outsiderCookie,
    });
    expect(membersRes.status).toBe(404);

    const detailRes = await call('GET', `/v1/organizations/${orgAId}`, {
      cookie: outsiderCookie,
    });
    expect(detailRes.status).toBe(404);

    const deptRes = await call('POST', `/v1/organizations/${orgAId}/departments`, {
      cookie: outsiderCookie,
      body: { name: 'Injected Dept' },
    });
    expect(deptRes.status).toBe(404);
  });

  it('tenant isolation: outsider cannot mutate org A members', async () => {
    const membersRes = await call('GET', `/v1/organizations/${orgCId}/members`, {
      cookie: outsiderCookie,
    });
    const members = (await membersRes.json()) as {
      members: { membershipId: string }[];
    };

    const patchRes = await call(
      'PATCH',
      `/v1/organizations/${orgAId}/members/${members.members[0]!.membershipId}`,
      { cookie: outsiderCookie, body: { status: 'suspended' } },
    );
    expect(patchRes.status).toBe(404);
  });

  it('records the member membership id and protects last owner', async () => {
    const membersRes = await call('GET', `/v1/organizations/${orgAId}/members`, {
      cookie: ownerCookie,
    });
    const members = (await membersRes.json()) as {
      members: { membershipId: string; role: { key: string }; user: { email: string } }[];
    };
    const ownerMember = members.members.find((m) => m.role.key === 'owner')!;
    memberMembershipId = ownerMember.membershipId;

    const deleteRes = await call(
      'DELETE',
      `/v1/organizations/${orgAId}/members/${memberMembershipId}`,
      { cookie: ownerCookie },
    );
    expect(deleteRes.status).toBe(409);
  });

  it('writes audit logs for org events', async () => {
    const { getDb, auditLogs } = await import('@nexora/database');
    const { eq } = await import('drizzle-orm');
    const rows = await getDb()
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, orgAId));
    const actions = rows.map((r) => r.action);
    expect(actions).toContain('auth.login');
    expect(actions).toContain('org.created');
    expect(actions).toContain('member.invited');
    expect(actions).toContain('member.joined');
  });

  it('logout revokes the session', async () => {
    await call('POST', '/v1/auth/logout', { cookie: memberCookie });
    const meRes = await call('GET', '/v1/auth/me', { cookie: memberCookie });
    expect(meRes.status).toBe(401);
  });

  it('unauthenticated requests are rejected', async () => {
    const res = await call('GET', '/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

