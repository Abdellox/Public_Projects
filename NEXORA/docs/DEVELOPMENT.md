# Development Guide

## Prerequisites

- Node.js ≥ 20, npm ≥ 10
- Docker Desktop (for Postgres 17 + Redis 7 via `docker-compose.yml`)

## First run

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate     # apply schema migrations
npm run db:seed        # demo company "NEXORA Labs" + 8 members
npm run dev            # API :4000 + web :3000 concurrently
```

Demo logins — password `Password123!` for all:

| Email | Role |
|---|---|
| ada@nexora.dev | Owner (CTO) |
| maya@nexora.dev | Admin |
| priya@nexora.dev | Admin |
| leo / ravi / sam / ana / omar `@nexora.dev` | Members |

## Scripts

Run from the repo root unless noted:

| Script | Purpose |
|---|---|
| `npm run dev` | API + web together |
| `npm run dev:api` / `npm run dev:web` | individually |
| `npm run typecheck` | tsc across every workspace |
| `npm run lint` | ESLint (flat config) |
| `npm test` / `npm run test:watch` | Vitest (unit always; integration with `TEST_DATABASE_URL`) |
| `npm run build --workspace @nexora/web` | production web build |
| `npm run db:generate` | generate SQL migration from Drizzle schema |
| `npm run db:migrate` | apply migrations (`packages/database/drizzle`) |
| `npm run db:seed` | idempotent demo data |

## Integration tests

```bash
docker compose up -d
npm run db:migrate
# PowerShell:
$env:TEST_DATABASE_URL="postgres://nexora:nexora@localhost:5432/nexora"; npm test
```

Without `TEST_DATABASE_URL`, DB-dependent suites skip automatically.

## Conventions

- **Authorization:** route handlers call `authorize()` from
  `apps/api/src/policy/policy.ts`; never hand-roll permission checks.
- **Validation:** every request body/query uses a schema from
  `@nexora/validation`; reuse it client-side for inline errors.
- **Errors:** throw helpers from `@nexora/types`
  (`badRequest/unauthorized/forbidden/notFound/conflict/gone`) — the global
  error handler renders the standard envelope.
- **Audit:** security-relevant mutations record an audit entry via
  `lib/audit.ts` inside the same transaction when possible.
- **Migrations are committed.** Never edit an applied migration; add a new one.
