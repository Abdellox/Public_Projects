# Security Policy

NEXORA handles organizational communication and knowledge — security bugs are
treated as critical.

## Supported versions

| Version | Supported |
|---|---|
| latest release | ✅ |
| older releases | ❌ (upgrade) |

## Reporting a vulnerability

**Do not open a public issue or PR for security problems.**

Email **security@nexora.dev** with:

1. A description of the vulnerability and its impact
2. Step-by-step reproduction (or PoC)
3. Affected version/commit

You will receive an acknowledgment within **72 hours**. We coordinate
disclosure with reporters and credit you in the advisory unless you prefer
otherwise.

## Security model highlights

- Authorization is enforced **server-side only**, through one shared policy
  engine used by CRUD, search and AI retrieval.
- Multi-tenant isolation: cross-organization access returns 404 (no
  enumeration) and is covered by regression tests (`apps/api/tests/integration`).
- Passwords: argon2id; sessions: opaque tokens stored as SHA-256 hashes.
- Audit logs are append-only and record security-relevant events.

Areas we especially welcome review of: tenant isolation, the permission
cache invalidation paths, invitation token handling, and (as they land)
permission-aware AI retrieval.
