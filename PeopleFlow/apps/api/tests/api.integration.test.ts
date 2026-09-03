import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { Env } from "@peopleflow/config";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const hasDb = Boolean(TEST_DATABASE_URL);

let app: FastifyInstance;

async function login(email: string): Promise<string[]> {
  const res = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { email, password: "Integration#2024" },
  });
  expect(res.statusCode).toBe(200);
  return res.cookies.map((c) => `${c.name}=${c.value}`);
}

describe.skipIf(!hasDb)("api integration (multi-tenant)", () => {
  let orgAOwnerCookies: string[];
  let orgBOwnerCookies: string[];

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    const { buildApp } = await import("../src/app.js");
    const { loadEnv } = await import("@peopleflow/config");
    const env: Env = loadEnv({
      NODE_ENV: "test",
      DATABASE_URL: TEST_DATABASE_URL,
      SESSION_SECRET: "integration-test-secret-0123456789",
      AI_PROVIDER: "none",
    });
    app = await buildApp({ env, secret: env.SESSION_SECRET });

    const suffix = Date.now().toString(36);
    for (const [email, orgName] of [
      [`owner-a-${suffix}@test.dev`, `Org A ${suffix}`],
      [`owner-b-${suffix}@test.dev`, `Org B ${suffix}`],
    ] as const) {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/signup",
        payload: {
          organizationName: orgName,
          email,
          password: "Integration#2024",
          name: email.startsWith("owner-a") ? "Alice A" : "Bob B",
        },
      });
      expect(res.statusCode).toBe(201);
    }

    orgAOwnerCookies = await login(`owner-a-${suffix}@test.dev`);
    orgBOwnerCookies = await login(`owner-b-${suffix}@test.dev`);

    (globalThis as { __pfSuffix?: string }).__pfSuffix = suffix;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("returns the caller identity and permissions", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/me", cookies: cookieHeader(orgAOwnerCookies) });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user.email).toContain("owner-a");
    expect(Array.isArray(body.permissions)).toBe(true);
    expect(body.permissions).toContain("*");
  });

  it("blocks unauthenticated access", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/employees" });
    expect(res.statusCode).toBe(401);
  });

  it("enforces tenant isolation on employee data", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/v1/employees",
      cookies: cookieHeader(orgAOwnerCookies),
      payload: {
        firstName: "Carol",
        lastName: "Isolated",
        email: "carol.isolated@orga.test",
        employmentType: "FULL_TIME",
        startDate: "2024-02-01",
      },
    });
    expect(created.statusCode).toBe(201);
    const employeeId = created.json().id as string;
    expect(employeeId).toBeTruthy();

    const crossAccess = await app.inject({
      method: "GET",
      url: `/api/v1/employees/${employeeId}`,
      cookies: cookieHeader(orgBOwnerCookies),
    });
    expect(crossAccess.statusCode).toBe(404);

    const crossUpdate = await app.inject({
      method: "PATCH",
      url: `/api/v1/employees/${employeeId}`,
      cookies: cookieHeader(orgBOwnerCookies),
      payload: { firstName: "Hacked" },
    });
    expect([403, 404]).toContain(crossUpdate.statusCode);

    const ownList = await app.inject({
      method: "GET",
      url: "/api/v1/employees?q=Isolated",
      cookies: cookieHeader(orgAOwnerCookies),
    });
    expect(ownList.statusCode).toBe(200);
    expect(ownList.json().data).toHaveLength(1);
  });

  it("runs the leave request lifecycle with balance updates", async () => {
    const me = await app.inject({ method: "GET", url: "/api/v1/me", cookies: cookieHeader(orgAOwnerCookies) });
    const employeeId = me.json().employeeId as string;

    const types = await app.inject({
      method: "GET",
      url: "/api/v1/leave/types",
      cookies: cookieHeader(orgAOwnerCookies),
    });
    const annualType = types.json().data.find((t: { name: string }) => t.name === "Annual Leave");
    expect(annualType).toBeTruthy();

    const nextMonday = (() => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + 30);
      while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
      return d.toISOString().slice(0, 10);
    })();
    const nextFriday = (() => {
      const d = new Date(`${nextMonday}T00:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() + 4);
      return d.toISOString().slice(0, 10);
    })();

    const created = await app.inject({
      method: "POST",
      url: "/api/v1/leave/requests",
      cookies: cookieHeader(orgAOwnerCookies),
      payload: { leaveTypeId: annualType.id, startDate: nextMonday, endDate: nextFriday },
    });
    expect(created.statusCode).toBe(201);
    const requestId = created.json().id as string;
    expect(created.json().days).toBe(5);

    const decided = await app.inject({
      method: "POST",
      url: `/api/v1/leave/requests/${requestId}/decide`,
      cookies: cookieHeader(orgAOwnerCookies),
      payload: { decision: "APPROVE" },
    });
    expect(decided.statusCode).toBe(200);
    expect(decided.json().status).toBe("APPROVED");

    const balances = await app.inject({
      method: "GET",
      url: `/api/v1/leave/balances?employeeId=${employeeId}`,
      cookies: cookieHeader(orgAOwnerCookies),
    });
    const annualBalance = balances.json().data.find((b: { leaveType: { id: string } }) => b.leaveType.id === annualType.id);
    expect(annualBalance.used).toBeGreaterThanOrEqual(5);
  });

  it("rejects invalid input with structured validation errors", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/employees",
      cookies: cookieHeader(orgAOwnerCookies),
      payload: { firstName: "", lastName: "X", email: "bad", employmentType: "ALIEN", startDate: "nope" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
  });

  it("writes to the audit log", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/audit?action=employee.created",
      cookies: cookieHeader(orgAOwnerCookies),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.length).toBeGreaterThan(0);
    expect(res.json().data[0].action).toBe("employee.created");
  });
});

function cookieHeader(cookies: string[]): Record<string, string> {
  const jar: Record<string, string> = {};
  for (const c of cookies) {
    const idx = c.indexOf("=");
    jar[c.slice(0, idx)] = c.slice(idx + 1).split(";")[0];
  }
  return jar;
}
