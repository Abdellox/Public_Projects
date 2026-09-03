# Busniex Monorepo Guide

This file documents the working conventions for **open-code / AI-assisted development** on BUSINEX.

## Commands (run from repo root)

- `npm install` — install all workspaces
- `npm run dev` — run API (`:4000`) and Web (`:3000`) concurrently
- `npm run dev:api` / `npm run dev:web` — run one app
- `npm run typecheck` — typecheck all workspaces
- `npm run lint` — ESLint over the repo
- `npm test` — run vitest tests
- `npm run db:push` — apply Drizzle schema to Postgres (dev convenience)
- `npm run db:generate` / `npm run db:migrate` — generate & apply SQL migrations
- `npm run db:seed` — seed the demo `acme` tenant
- `npm run docker:up` / `npm run docker:down` — start/stop Postgres & Redis

## Architecture rules (do not violate)

- **One core data model.** Use canonical entities: `Party`, `Product`,
  `OrganizationUnit`, `User`, `Invoice`, `Order`. Never introduce a duplicated
  per-module entity (e.g. `CRMCustomer`, `POSProduct`).
- **Modular monolith.** Each module owns its schema and exposes a Hono router.
  Cross-module flow uses the in-process `EventBus` (@businex/lib) and shared
  packages — not direct coupling where avoidable.
- **Centralized cross-cutting.** Identity/permissions (@businex/auth), workflow
  (@businex/module-workflow), audit, notifications and documents are shared —
  every module must use them, not reimplement.
- **Config over duplication.** Prefer configuration and extensions over forking.

## Adding a module

1. Create `modules/<name>/` with `package.json` (name `@businex/module-<name>`)
   and a `src/index.ts` exporting `register(db, parentHono)` and a `ModuleDescriptor`.
2. Add the schema to `packages/database/src/schema/`.
3. Declare the workspace dependency in `apps/api/package.json` and wire it in
   `apps/api/src/index.ts` (route namespace + auth middleware + registration).
4. Reuse `@businex/types`, `@businex/validation`, `@businex/lib`, `@businex/auth`.

## Testing

- Pure logic lives in `@businex/lib` with vitest unit tests (`src/*.test.ts`).
- Run `npm test` to execute.
