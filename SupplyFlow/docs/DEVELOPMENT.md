# Development

## Prerequisites

- Node.js ≥ 20
- PostgreSQL 16 (local, Docker, or hosted)
- (optional) Redis — reserved for background jobs; not required yet

## Setup

```bash
# 1. Install workspace dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    Set DATABASE_URL and AUTH_SECRET (openssl rand -hex 32)

# 3. Create schema + demo data
npm run db:migrate
npm run db:seed

# 4. Run
npm run dev            # http://localhost:3000
```

Log in with a seeded account (see docs/DATABASE.md → Demo credentials).

## Repository layout

```
apps/web               Next.js app (UI + API routes)
packages/database      Drizzle schema, migrations, business services, seed
packages/auth          password hashing + session management
packages/validation    Zod schemas shared by client and server
packages/types         RBAC matrix + shared domain types
docs                   architecture & operations guides
tests                  vitest unit tests (pure logic, no DB needed)
```

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server with HMR |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` in every workspace |
| `npm run lint` | ESLint (next config) |
| `npm test` | Vitest unit tests |
| `npm run db:generate` | Generate migration from schema diff |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Dev-only direct schema push |
| `npm run db:seed` | Reset-free demo data insert |

## Where to make common changes

- **New field on an entity** → `packages/database/src/schema/core.ts` → `npm run db:generate` → add to the Zod schema in `packages/validation/src/index.ts` → surface in the relevant API route + UI page.
- **New API endpoint** → copy the pattern from any route under `apps/web/src/app/api/v1/`; use `requirePermission`, Zod parse, `jsonOk`, `logAudit`.
- **New permission** → add to the matrix in `packages/types/src/rbac.ts`; it is enforced server-side only.
- **Grid/UI primitives** → `apps/web/src/components/data-grid.tsx`, `ui.tsx`.

## Testing

Unit tests (`tests/*.test.ts`) cover pure logic: RBAC matrix, planning math, inventory direction mapping. They run without a database:

```bash
npm test
```

Integration testing against Postgres is manual for now: run migrations + seed locally, then exercise flows through the UI or `curl` (see docs/API.md).

## Conventions

- TypeScript strict everywhere; no `any` without justification.
- Money stays **string** until formatted at the edge (`fmtMoney`); never float-math money.
- Server code never trusts client-provided `organizationId`.
- Comments only where intent isn't obvious from code.
