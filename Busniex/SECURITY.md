# Security Policy

## Supported versions

BUSINEX is early-stage software (pre-1.0). We provide security fixes on the
latest release and on `main`.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities. Instead,
report privately by opening a GitHub Security Advisory
(Repository → Security → "Report a vulnerability"), or by emailing the
maintainers via a direct message on GitHub.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (or a proof of concept)
- Affected versions / areas
- Any suggested fixes, if you have them

We will acknowledge reports promptly and keep you informed of fixes.

## Secure development notes for contributors

- Never commit real secrets or `.env` files (the `.gitignore` excludes them).
- The `.env.example` values are development-only; production requires replacing
  `JWT_SECRET`, `DATABASE_URL`, and credentials.
- Password hashing uses PBKDF2 with per-user salts (`@businex/lib`).
- Every sensitive operation should write an immutable audit entry.

## If you find a dependency vulnerability

Run `npm audit` and open an issue referencing the advisory so we can update the
affected dependency.
