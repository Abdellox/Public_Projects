# Architecture

NEXORA is a **modular monolith**: one deployable API + one web app, with
package boundaries that keep future service extraction cheap.

```
Browser ──SSR/WS──▶ Next.js (apps/web) ──proxy──▶ Fastify API (apps/api)
                                                     │
                    ┌────────────────────────────────┼─────────────┐
                    ▼                    ▼           ▼             ▼
              PostgreSQL            Redis        Object       AI/Search
            (source of truth)    (cache/limits/ storage      providers
                                  presence)                 (adapters)
```

## Layering rules

1. **Database is authoritative.** Realtime events are delivery, never truth.
2. **One policy engine.** `apps/api/src/policy/policy.ts` resolves
   `user → membership → role → permissions → resource → action` for every
   protected operation — CRUD, search, and (later) AI retrieval share it.
3. **Modules over layers inside the API.** Each module (`auth`,
   `organizations`, `structure`, `members`, `me`, `admin`) owns its
   service + routes and talks to other modules through services, not tables.
4. **Contracts are shared.** `packages/validation` schemas validate input on
   the server and power inline form validation in the browser.
5. **Providers are swappable.** Search and AI sit behind interfaces
   (`SearchProvider`, `AIProvider`) so PostgreSQL FTS can graduate to a
   dedicated engine and OpenAI can be replaced by Anthropic or local models
   without touching product code.

## Tenant isolation model

- Every organization-scoped table carries `organization_id`.
- Route handlers derive the tenant from the authenticated membership — never
  from client-supplied ids alone; resource-id-based routes resolve ownership
  server-side before authorizing.
- Non-members receive **404**, not 403, to prevent org enumeration.
- Permission caches are keyed by `organization:userId` with TTL + explicit
  invalidation on role/membership mutations.
- Regression tests in `apps/api/tests/integration/authz.int.test.ts` prove
  cross-tenant denial, permission gating and last-owner protection.

## Key decisions (ADRs)

- [ADR-0001 — Modular monolith first](adr/0001-modular-monolith.md)
