import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';

/**
 * These tests exercise the app router without a database by asserting the
 * public, unauthenticated endpoints respond correctly. Database-backed module
 * tests belong in each module package with a real Postgres fixture.
 */

describe('businex api metadata', () => {
  let app: Hono;

  beforeAll(async () => {
    app = (await import('./index')).default as unknown as Hono;
  });

  it('exposes a health endpoint', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('exposes the module registry', async () => {
    const res = await app.request('/modules');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.modules).toContain('crm');
    expect(body.modules).toContain('invoicing');
  });
});
