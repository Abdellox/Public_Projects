# Contributing to Nexora CRM

Thank you for helping build an open alternative to traditional CRM software!
This document explains how to set up, work, and submit changes.

## Development setup

```bash
git clone https://github.com/<org>/nexora-crm.git
cd nexora-crm
cp .env.example .env
cp apps/web/.env.example apps/web/.env

npm install

# infrastructure (PostgreSQL + Redis)
docker compose -f infrastructure/docker-compose.yml up -d

# database
npm run db:migrate
npm run db:seed        # optional demo data

npm run dev            # api on :4000, web on :3000
```

No Docker? Any PostgreSQL 14+ works — point `DATABASE_URL` at it.

## Repository layout

See the README for the full map. In short:

- `apps/api` — Hono REST API (`/v1/*`)
- `apps/web` — Next.js frontend
- `packages/*` — shared contracts, validation, auth, database schema, UI kit

## Ground rules

1. **Security first.** Tenant isolation and permission checks happen
   server-side. If your change touches queries or endpoints, add a test that
   proves isolation.
2. **Migrations are reviewable SQL.** Never `drizzle-kit push`. Run
   `npm run db:generate` and commit the generated migration.
3. **No fake features.** Buttons must call real endpoints. If something is not
   built yet, leave it out.
4. **Small, focused PRs.** One feature or fix per PR; keep diffs reviewable.
5. **Conventional commits**: `feat(api): ...`, `fix(web): ...`,
   `chore(db): ...`, `docs: ...`.

## Before you open a PR

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

All four must pass. CI runs the same plus integration tests against
PostgreSQL.

## Tests

- Unit tests live next to packages (`test/` folders) and always run.
- Integration tests need a reachable `DATABASE_URL`; they skip automatically
  when absent. CI provides one.

## Adding permissions / roles

Permission keys are defined once in `packages/types`. New keys must be added
to the catalog, seeded via migrations, and covered by RBAC tests.

## Questions?

Open a GitHub Discussion or a draft PR early — feedback early is cheap.
