# Security Policy

## Supported versions

The MVP is under active development. Security updates are applied to the
`main` branch and released releases.

| Version | Supported |
|---------|-----------|
| main    | ✅         |

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities. Instead,
email the maintainer privately, or open a private security advisory on GitHub:

- **GitHub advisory:** https://github.com/Abdellox/Public_Projects/security/advisories/new

Please include:

- A description of the vulnerability
- Steps to reproduce
- Affected version(s)
- Any suggested fix, if you have one

We aim to acknowledge reports within 7 days and will keep you updated on
progress.

## Security principles for FootLink

- **No secrets in the client.** The mobile app only ever uses the Supabase
  public (anon) key provided at build time via `--dart-define`. Never commit
  the `service_role` key or any server secrets.
- **Row Level Security.** All data access goes through Supabase so RLS
  policies are enforced server-side, never client-side.
- **Limited location data.** Exact home addresses are never stored or shown;
  we only keep approximate coordinates and public meeting points.
- **Safe joins & anti-abuse.** Reports, blocking, rate limits and repeated
  fake-rating detection are part of the moderation model.

To learn about security best practices across this repository, see the root
`SECURITY.md` (if present) and the Supabase docs on [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
