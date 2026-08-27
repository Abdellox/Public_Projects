# Architecture

Nexora CRM is a **modular monolith**: one deployable backend and one web app,
with strict internal module boundaries so services can be extracted later if
scale ever demands it.

## System overview

```
Browser (Next.js)
   │  HTTPS (session cookie)
   ▼
Hono API (/v1/*)                     PostgreSQL ── source of truth
 ├─ middleware: session → tenant → RBAC      Redis      ── cache/queues (later phases)
 ├─ modules: auth · orgs · members ·         S3         ── files (later phases)
 │            invitations · departments ·
 │            teams · roles
 └─ cross-cutting: rate limiting · audit log · validation (Zod)
```

## Request pipeline

Every protected request flows through the same chain:

1. `resolveSession` — validates the opaque session token (SHA-256 hashed at
   rest) against the `sessions` table; attaches the user.
2. `requireOrganization` — resolves the `(user, organization)` membership,
   role, and permission set. A missing membership returns **404**, identical
   to a missing organization, so foreign tenant IDs cannot be probed.
3. `requirePermission(key)` — checks the resolved permission set.

Business logic lives in module *services*; routes stay thin. The same policy
engine serves REST today and will serve search/AI retrieval in later phases —
one implementation, no drift.

## Multi-tenancy

- Every tenant-owned row carries an `organization_id`.
- All queries filter by the organization resolved from the **server-side**
  session, never from client input beyond route parameters that are then
  validated against it.
- Integration tests prove isolation (`apps/api/test/integration`).

## Key decisions (ADRs)

| # | Decision | Status |
|---|----------|--------|
| [0001](./adr/0001-modular-monolith.md) | Modular monolith over microservices | Accepted |
| [0002](./adr/0002-drizzle-postgres.md) | PostgreSQL + Drizzle ORM | Accepted |
| [0003](./adr/0003-opaque-sessions.md) | Opaque DB-backed sessions (not JWT) for the web app | Accepted |

## Directory map

See the root README ("Repository structure").
