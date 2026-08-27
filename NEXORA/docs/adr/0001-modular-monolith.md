# ADR-0001: Modular monolith first

**Status:** Accepted
**Date:** 2026-08-24

## Context

NEXORA must support organizations from 5 to 500,000 employees. The team is
small and open-source contributors need a codebase they can run locally in
minutes and reason about quickly.

## Decision

Build a single Fastify API process with strict module boundaries
(`apps/api/src/modules/*`) plus one Next.js web app. Extract services only
when there is a measured scalability or ownership reason.

## Consequences

+ One-command local development; no distributed debugging.
+ Atomic cross-module transactions (e.g., org creation writes org, roles,
  grants and membership in one tx).
+ Contributors touch one repo, one runtime.
− Hot modules (realtime fan-out, AI jobs) must keep interfaces clean so later
  extraction does not require rewrites.
− Process-level scaling limits are deferred, not eliminated.
