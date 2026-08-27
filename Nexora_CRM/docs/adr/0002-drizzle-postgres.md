# ADR 0002 — PostgreSQL + Drizzle ORM

**Status:** Accepted

## Context

CRM data is intensely relational (organizations → memberships → roles →
records), needs strict tenant isolation, custom fields later, and full-text
search as a baseline.

## Decision

- **PostgreSQL 14+** as the only source of truth.
- **Drizzle ORM** for schema-as-TypeScript, reviewable SQL migrations
  (`drizzle-kit generate`/`migrate`), and typed query building with no hidden
  lazy-loading (N+1s are visible).

JSONB columns back future custom-field values so organizations can add fields
without migrations. Redis is used only for ephemeral concerns (rate limiting
today, queues/caching in later phases).

## Consequences

- ✅ Relational integrity enforced by the database, not conventions.
- ✅ `pg` FTS covers search until a dedicated engine is justified behind the
  planned `SearchProvider` interface.
- ✅ Migrations are diffable SQL — friendly to OSS review.
- ⚠️ Drizzle's API is younger than Prisma's; mitigated by a small, explicit
  data layer inside `@nexora/database`.
