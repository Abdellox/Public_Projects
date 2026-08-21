# Security Policy

## Supported versions

OSS Radar is a young project — only the latest commit on `main` is supported.

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities.

Instead, contact the maintainer privately:
- GitHub: [@Abdellox](https://github.com/Abdellox)
- Or use GitHub's "Report a vulnerability" feature on this repository.

You will receive a response within a few days with next steps.

## Scope notes

OSS Radar is a static Next.js site that reads public data from the GitHub API.
There is no database, no user accounts, and no secrets beyond an optional
read-only `GITHUB_TOKEN` kept in `.env.local` (never committed). Reports about
dependency vulnerabilities are still welcome.
