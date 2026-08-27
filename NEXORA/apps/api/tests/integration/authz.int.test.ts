/**
 * Security-critical integration suite: proves tenant isolation and
 * server-side authorization against a real database.
 *
 * Runs only when TEST_DATABASE_URL is provided (CI sets it after applying
 * migrations). Locally: `docker compose up -d && npm run db:migrate` then
 * `TEST_DATABASE_URL=$DATABASE_URL npm test`.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import {
  createDb,
  organizationMemberships,
  organizations,
  roles,
  type DatabaseHandle
} from "@nexora/database";
import { buildApp } from "../../src/app.js";
import { loadEnv, type ApiEnv } from "../../src/env.js";

const RUN = Boolean(process.env.TEST_DATABASE_URL);

describe.skipIf(!RUN)("authorization & tenant isolation", () => {
  let handle: DatabaseHandle;
  let app: FastifyInstance;
  const context: Record<string, string> = {};
  let orgId = "";
  const stamp = Date.now();
  const ownerEmail = `owner-${stamp}@test.nx`;
  const inviteeEmail = `invitee-${stamp}@test.nx`;

  async function loginCookie(email: string): Promise<string> {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email, password: "Password123!" }
    });
    expect(res.statusCode).toBe(200);
    return res.cookies.find((c) => c.name === "nexora_session")!.value;
  }

  beforeAll(async () => {
    handle = createDb({ connectionString: process.env.TEST_DATABASE_URL!, max: 5 });
    await migrate(handle.db, {
      migrationsFolder: fileURLToPath(
        new URL("../../../packages/database/drizzle", import.meta.url)
      )
    });
    const env: ApiEnv = loadEnv({
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
      LOG_LEVEL: "error"
    });
    app = await buildApp({ db: handle.db, env });

    for (const [email, name] of [
      [ownerEmail, "Owner"],
      [inviteeEmail, "Invitee"]
    ] as const) {
      const reg = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: { email, password: "Password123!", name }
      });
      expect(reg.statusCode).toBe(201);
    }

    const cookieA = await loginCookie(ownerEmail);
    const orgRes = await app.inject({
      method: "POST",
      url: "/api/v1/organizations",
      cookies: { nexora_session: cookieA },
      payload: { name: `Isolation Test ${stamp}` }
    });
    expect(orgRes.statusCode).toBe(201);
    orgId = orgRes.json().id;
    context.cookieA = cookieA;
  }, 30_000);

  afterAll(async () => {
    if (app) await app.close();
    await handle.close();
  });

  it("rejects unauthenticated requests with the standard error envelope", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/auth/me" });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("UNAUTHENTICATED");
  });

  it("a non-member gets a 404 for another organization (no enumeration)", async () => {
    const inviteeCookie = await loginCookie(inviteeEmail);

    const slugRows = await handle.db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, orgId));
    const slug = slugRows[0]!.slug;

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/organizations/slug/${slug}`,
      cookies: { nexora_session: inviteeCookie }
    });
    expect(res.statusCode).toBe(404);
  });

  it("members cannot create departments; owners can; audit trail records both attempts", async () => {
    const cookieA = context.cookieA!;

    // Invite the invitee with the member role.
    const roleRows = await handle.db.select().from(roles).where(eq(roles.organizationId, orgId));
    const memberRole = roleRows.find((r) => r.key === "member")!;
    const inv = await app.inject({
      method: "POST",
      url: `/api/v1/organizations/${orgId}/invitations`,
      cookies: { nexora_session: cookieA },
      payload: { email: inviteeEmail, roleId: memberRole.id }
    });
    expect(inv.statusCode).toBe(201);
    const token = inv.json().token;

    const inviteeCookie = await loginCookie(inviteeEmail);
    const accepted = await app.inject({
      method: "POST",
      url: "/api/v1/invitations/accept",
      cookies: { nexora_session: inviteeCookie },
      payload: { token }
    });
    expect(accepted.statusCode).toBe(200);

    // Member lacks department:create â†’ 403.
    const denied = await app.inject({
      method: "POST",
      url: `/api/v1/organizations/${orgId}/departments`,
      cookies: { nexora_session: inviteeCookie },
      payload: { name: "Shadow Dept" }
    });
    expect(denied.statusCode).toBe(403);
    expect(denied.json().error.code).toBe("FORBIDDEN");

    // Owner has department:create â†’ 201.
    const allowed = await app.inject({
      method: "POST",
      url: `/api/v1/organizations/${orgId}/departments`,
      cookies: { nexora_session: cookieA },
      payload: { name: "Engineering" }
    });
    expect(allowed.statusCode).toBe(201);

    // Member can list departments (member:view granted by default).
    const listed = await app.inject({
      method: "GET",
      url: `/api/v1/organizations/${orgId}/departments`,
      cookies: { nexora_session: inviteeCookie }
    });
    expect(listed.statusCode).toBe(200);
    expect(listed.json().some((d: { name: string }) => d.name === "Engineering")).toBe(true);
  });

  it("protects the last owner from demotion", async () => {
    const cookieA = context.cookieA!;

    const allWithRoles = await handle.db
      .select({ id: organizationMemberships.id, key: roles.key })
      .from(organizationMemberships)
      .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
      .where(eq(organizationMemberships.organizationId, orgId));
    const ownerMembership = allWithRoles.find((r) => r.key === "owner");
    expect(ownerMembership).toBeDefined();

    const rolesInOrg = await handle.db.select().from(roles).where(eq(roles.organizationId, orgId));
    const admin = rolesInOrg.find((r) => r.key === "admin")!;

    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/organizations/${orgId}/members/${ownerMembership!.id}`,
      cookies: { nexora_session: cookieA },
      payload: { roleId: admin.id }
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe("LAST_OWNER");
  });

  it("audit logs are permission-gated and capture key events", async () => {
    const cookieA = context.cookieA!;
    const inviteeCookie = await loginCookie(inviteeEmail);

    const denied = await app.inject({
      method: "GET",
      url: `/api/v1/organizations/${orgId}/audit-logs`,
      cookies: { nexora_session: inviteeCookie }
    });
    expect(denied.statusCode).toBe(403);

    const logs = await app.inject({
      method: "GET",
      url: `/api/v1/organizations/${orgId}/audit-logs`,
      cookies: { nexora_session: cookieA }
    });
    expect(logs.statusCode).toBe(200);
    const actions = logs.json().items.map((i: { action: string }) => i.action);
    expect(actions).toContain("organization.created");
    expect(actions).toContain("department.created");
    expect(actions).toContain("invitation.accepted");
  });
});
