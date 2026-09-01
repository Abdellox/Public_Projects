# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

Please do **not** open a public issue for security vulnerabilities. Instead, report
them privately.

If a security vulnerability is found, please open a draft security advisory on the
GitHub repository (under *Security → Report a vulnerability*), or contact the
maintainers directly through the issue tracker's private channels when available.

You can expect an acknowledgement within 72 hours and a plan to address the issue.

## Disclosure policy

We ask that you:

- Do not exploit the vulnerability beyond what is necessary to demonstrate it.
- Give us a reasonable window (at least 90 days where practical) to fix and release
  the issue before publishing details.
- Include steps to reproduce and, if possible, a suggested fix or impact assessment.

## Security considerations for this project

AlgoAtlas renders Markdown content author-provided by contributors. While we use
`react-markdown` (which does **not** render raw HTML by default) and escape
content, treat any contributed Markdown from unseen contributors as untrusted.
Configuration changes and dependency updates are reviewed in pull requests.
