# Security Policy

## Reporting a vulnerability

If you find a security vulnerability in AgentGuard, please report it privately:

1. Open a GitHub security advisory on this repository (preferred), or
2. Contact the maintainers directly (see the GitHub profile of the repository owner).

Do **not** open a public issue for security problems.

We aim to acknowledge reports within 7 days and will work with you on coordinated disclosure.

## Scope and honest threat model

AgentGuard is a userspace monitoring and policy layer. It is **not** a sandbox. Known limitations you should assume attackers may exploit:

- Commands executed outside `agentguard exec` are not observed.
- File change tracking relies on git snapshots; changes outside git repos, or to ignored paths, are not tracked.
- Network enforcement is not implemented.
- An agent with arbitrary code execution inside your user account can attempt to disable or bypass AgentGuard itself.

Use AgentGuard as one layer alongside containers, VMs, and least-privilege accounts.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | ✅ |

## Data handling

AgentGuard stores all session data locally under `.agentguard/sessions/`. Secrets detected in command lines are redacted before storage. No data leaves your machine by design — if you ever find otherwise, that is a critical vulnerability per this policy.
