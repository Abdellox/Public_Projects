# Contributing to NEXORA

Thanks for helping build the open-source digital organization. This document
gets you from clone to first merged PR.

## Development setup

Prerequisites: **Node.js ≥ 20**, npm ≥ 10, Docker (for Postgres/Redis).

```bash
git clone https://github.com/<org>/nexora.git
cd nexora

cp .env.example .env          # defaults work with docker-compose.yml
docker compose up -d          # postgres + redis

npm install
npm run db:migrate            # apply schema migrations
npm run db:seed               # demo company: 6 departments, 8 members
npm run dev                   # API on :4000, web on :3000
```

Demo login: `ada@nexora.dev` / `Password123!` (any seeded email works — see
`packages/database/src/scripts/seed.ts` for all of them).

## Repository layout

| Path | What lives there |
|---|---|
| `apps/api` | Fastify API: modules, policy engine, audit |
| `apps/web` | Next.js UI: design system + feature pages |
| `packages/types` | Shared domain types & permission catalog |
| `packages/validation` | Zod request/response contracts |
| `packages/database` | Drizzle schema, migrations, seed |
| `packages/auth` | Password hashing, session tokens/sessions |

## Ground rules

1. **Authorization is server-side, always.** New endpoints must resolve
   `user → membership → role → permission → resource → action` through
   `src/policy/policy.ts`. If your feature touches search or AI retrieval,
   the same rules apply there.
2. **Never trust client input** — validate with a schema from
   `@nexora/validation`; share it with the UI instead of duplicating.
3. **Tenant isolation:** every org-scoped query carries `organization_id`
   resolved server-side. Add tests proving isolation if you touch data access.
4. **No hardcoded organizations/departments/permissions/providers.**
5. Keep PRs focused; include DB changes + backend + authz + API + UI + tests
   together when implementing a feature.
6. Run before pushing:

```bash
npm run lint && npm run typecheck && npm test && npm run build --workspace @nexora/web
```

## Commit style

Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`,
`chore:`). Architectural decisions belong in `docs/adr/NNNN-title.md`.

## Reporting issues

Use the issue templates. Security issues: see [SECURITY.md](SECURITY.md) —
do not open public issues for them.
