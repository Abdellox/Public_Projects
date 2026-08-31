# Security Policy

SupplyFlow stores sensitive business data (inventory, costs, suppliers, orders). Security is a core product requirement, not an afterthought.

## Supported versions

| Version | Supported |
| --- | --- |
| latest release | ✅ |
| older releases | ❌ — please upgrade |

## Reporting a vulnerability

**Do NOT open a public issue for security vulnerabilities.**

Instead:

1. Use GitHub's [private vulnerability reporting](../../security/advisories/new), or
2. Email **security@supplyflow.dev** with:
   - Description of the vulnerability
   - Steps to reproduce / proof of concept
   - Affected components and versions
   - Your assessment of severity and impact

You will receive an acknowledgment within **48 hours**. We aim to:

- Triages within 7 days
- Publish fixes for critical issues within 30 days
- Credit reporters (unless anonymity is requested) in release notes

Please allow us time to patch before any public disclosure. Coordinated disclosure is appreciated.

## Security model highlights

For context when assessing reports, SupplyFlow enforces:

- **Tenant isolation** — every data row carries an `organization_id`; all queries are scoped server-side.
- **Server-side authorization** — RBAC checks happen in the API layer; client state is never trusted.
- **Password hashing** — argon2id with per-user salts.
- **Sessions** — httpOnly, Secure, SameSite cookies; rotation on privilege change.
- **Input validation** — Zod schemas validate all external input at API boundaries.
- **SQL injection prevention** — parameterized queries only via Drizzle ORM.
- **XSS protection** — React escaping + strict CSP headers.
- **CSRF protection** — SameSite cookies plus origin checking on mutations.
- **Rate limiting** — on authentication and expensive endpoints.
- **Audit logging** — auth events, exports, permission changes, and destructive actions are recorded.
- **File handling** — uploads validated by type/size, stored under unguessable keys, served through authorized URLs only.

Secrets are supplied via environment variables and never committed. See `.env.example` for required configuration.

## Hardening checklist for self-hosters

- Run behind HTTPS with modern TLS only.
- Set strong `AUTH_SECRET` and database credentials.
- Restrict database/network access to the application.
- Keep dependencies updated (`npm audit` runs in CI).
- Take regular encrypted backups of Postgres and object storage.
