# Development guide

## Prerequisites

- Node.js ≥ 20.11 (22 recommended)
- PostgreSQL 14+ (via Docker Compose or native install)
- Redis (optional in early phases)

## First run

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env

docker compose -f infrastructure/docker-compose.yml up -d   # or use your own Postgres
npm install

npm run db:migrate     # apply migrations
npm run db:seed        # demo org: demo-owner@nexora.local / Demo1234!

npm run dev            # API :4000 + Web :3000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Run API + web concurrently |
| `npm run dev:api` / `dev:web` | One process each |
| `npm run typecheck` | TypeScript, all workspaces |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (+ integration when `DATABASE_URL` is set) |
| `npm run db:generate` | Generate SQL migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Drizzle Studio (DB browser) |
| `npm run docker:up` / `down` | Postgres + Redis via Compose |

## Workflow for schema changes

1. Edit `packages/database/src/schema.ts`.
2. `npm run db:generate` — commit the generated SQL.
3. `npm run db:migrate`.

Never edit applied migrations; add a new one.

## Testing

```
apps/api/test/unit           # always run
apps/api/test/integration    # need a reachable DATABASE_URL (skip otherwise)
packages/validation/test     # contract tests
```

Integration tests are self-cleaning and prove tenant isolation. CI runs them
against a real PostgreSQL.

## Adding an API module

1. Schema first (`@nexora/database`), migration second.
2. Zod request contracts in `@nexora/validation`.
3. Service functions with authorization inside the route via
   `requirePermission(...)`.
4. Audit-log significant mutations (`writeAudit`).
5. Tests: happy path + RBAC denial + cross-tenant 404.
