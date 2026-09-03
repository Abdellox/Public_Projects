# Security Policy

PeopleFlow handles highly sensitive HR data. Security issues are treated with the highest priority.

## Supported versions

| Version | Supported |
| --- | --- |
| latest release | ✅ |
| older releases | ❌ — upgrade |

## Reporting a vulnerability

**Do not open a public issue or PR for security problems.**

Email **security@peopleflow.dev** (or use GitHub's *Report a vulnerability* on the Security tab) with:

1. A description of the issue and its impact
2. Step-by-step reproduction instructions or a PoC
3. Affected versions/commits
4. Any suggested mitigation

You will receive an acknowledgment within **48 hours**. We aim to:

* Triage within 7 days
* Publish a fix for critical issues within 30 days
* Credit reporters (unless anonymity is requested) in the release notes

Please allow us reasonable time to fix issues before any public disclosure.

## Scope

In scope: authentication/session weaknesses, tenant isolation bypasses, authorization
bypasses (including via the AI assistant), injection flaws, insecure file handling,
secrets leakage, and anything else that could expose HR data.

Out of scope: self-XSS, missing rate limits on non-sensitive endpoints, attacks requiring
physical access, and vulnerabilities in third-party dependencies (report those upstream,
but let us know if a version pin fixes it).

## Security design references

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the multi-tenancy, RBAC and AI
security model. Hard rules of this codebase:

* Passwords are never stored in plaintext; sessions are stored hashed
* Tenant isolation is enforced at the data-access layer **and** via a Prisma client extension
* Authorization always happens server-side
* Documents are never served from public URLs
* Sensitive actions (salary access, exports, document downloads, role changes…) are audit-logged
