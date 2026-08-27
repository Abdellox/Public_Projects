# ADR 0001 — Modular monolith over microservices

**Status:** Accepted

## Context

Nexora must be fast to build, easy to self-host, and simple enough for an
open-source community to understand — while leaving room to scale.

## Decision

Ship a single API process (Hono) with strict internal module boundaries
(`modules/*`, explicit service interfaces) plus a Next.js web app. No network
hops inside the product; no distributed transactions; one database.

## Consequences

- ✅ One `docker compose up` for self-hosters.
- ✅ Refactors and cross-module features stay cheap.
- ✅ Debugging and tests are straightforward (in-process).
- ⚠️ Modules must resist entangling: shared code goes through packages, not
  deep imports. Enforced by review and structure, not tooling (yet).
- ➡️ Extraction candidates later: AI workers, import/export jobs, search
  indexing. The module seams make this a deployment change, not a rewrite.
