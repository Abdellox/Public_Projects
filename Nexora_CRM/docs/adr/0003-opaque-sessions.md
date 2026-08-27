# ADR 0003 — Opaque DB-backed sessions for the web app

**Status:** Accepted

## Context

The browser app needs authentication that supports instant revocation
(kick a member when removed from an organization), MFA-readiness, and defense
against XSS token theft. JWTs are stateless but hard to revoke and encourage
storing secrets client-side.

## Decision

Use server-side sessions: a random 256-bit opaque token in an HttpOnly,
SameSite=Lax cookie; only its SHA-256 hash is stored. Sessions carry IP /
user-agent metadata and sliding last-used refresh.

Machine-to-machine/API-token auth will reuse the same hashing approach via
personal access tokens in a later milestone.

## Consequences

- ✅ Instant revocation: delete/revoke rows (e.g., org deletion revokes all
  member sessions).
- ✅ Nothing secret lives in the browser beyond the opaque cookie value.
- ✅ Compromise of the database does not yield usable credentials.
- ⚠️ Each request performs one indexed session lookup (acceptable; cacheable
  later with tenant-scoped invalidation).
