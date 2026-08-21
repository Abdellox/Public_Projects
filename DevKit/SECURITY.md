# Security Policy

## Supported versions

DevKit is a young project — only the latest commit on `main` is supported.

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities.

Instead, contact the maintainer privately:
- GitHub: [@Abdellox](https://github.com/Abdellox)
- Or use GitHub's "Report a vulnerability" feature on this repository.

You will receive a response within a few days with next steps.

## Scope notes

DevKit is a fully static Next.js site. Every tool runs **100% client-side** —
there is no backend, no database, no user accounts, no analytics and no secrets.
The main risk surface is dependency vulnerabilities and XSS through tool inputs
(e.g. Markdown rendering, which is sanitized with DOMPurify). Reports about
either are very welcome.
