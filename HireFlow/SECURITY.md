# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in HireFlow, please report it responsibly.

**Do NOT open a public issue for security vulnerabilities.**

Instead, email security concerns directly to the repository maintainers via GitHub Issues with the `security` label, or contact the maintainer directly.

## Scope

This security policy applies to:
- The HireFlow application code in this repository
- Authentication and authorization mechanisms
- Data handling and storage

## What to Include

When reporting a vulnerability, please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response

We aim to acknowledge reports within 48 hours and provide a fix timeline within one week for confirmed vulnerabilities.

## Best Practices

- Never commit secrets, API keys, or passwords
- Always use environment variables for sensitive configuration
- Validate all user input on both client and server
- Use Prisma parameterized queries (never string concatenation)
- Follow the principle of least privilege
