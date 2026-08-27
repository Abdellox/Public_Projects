# Security Policy

Security is a core promise of Nexora CRM: strict tenant isolation,
server-side authorization, and safe handling of customer data.

## Supported versions

| Version | Supported |
|---------|-----------|
| latest `main` | ✅ |
| older releases | ❌ — upgrade first |

## Reporting a vulnerability

**Do not open a public GitHub issue.**

1. Use GitHub's *Report a vulnerability* feature (Security tab → Advisories), or
2. email `security@nexora.dev` with:

   - a description of the issue and its impact,
   - step-by-step reproduction (PoC scripts welcome),
   - affected versions/commit hash.

We aim to acknowledge reports within **72 hours** and will keep you informed
of progress toward a fix and coordinated disclosure.

## Scope highlights (what we care about most)

- Cross-tenant data access (any endpoint reachable from another organization)
- Authorization bypasses (RBAC, object-level permission checks)
- Session fixation, token leakage, or authentication flaws
- Injection (SQL, XSS, prompt-injection into AI retrieval)
- Insecure file upload/download paths
- Rate-limiting or audit-log bypasses

## Safe harbor

Good-faith research following this policy is welcome and will not be met with
legal action.
