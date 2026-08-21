# Contributing to AgentGuard

Thanks for helping make AI coding agents safer. This document explains how to set up the project and where the extension points are.

> This project lives in the [Public_Projects](https://github.com/Abdellox/Public_Projects) monorepo. When opening an issue, use the repository issue templates and prefix your title with **[AgentGuard]**. Keep pull requests inside the `AgentGuard/` folder.

## Development setup

```bash
git clone <your-fork>
cd agentguard
npm install
npm test        # typecheck + build + unit tests + end-to-end CLI test
```

- Node.js 18+ required.
- `npm run dev -- --help` runs the CLI from source via tsx.
- Tests use the built-in Node test runner. The end-to-end test builds real git repos in temp directories — no mocking of the security path.

## Project layout

See "Architecture" in the README. The rule that keeps this codebase healthy: **the core never imports from a specific adapter, detector, or report format**. Everything flows through interfaces.

## Writing an agent adapter

Adapters turn a specific AI agent's activity into AgentGuard events. Read [docs/ADAPTERS.md](docs/ADAPTERS.md) for the full guide and interface contract.

## Adding secret detector rules

Rules live in `src/detectors/secrets.ts` as an array of `{ id, label, pattern }`. Requirements for a new rule:

1. High confidence — false positives erode trust faster than missed secrets.
2. Add at least one positive and one negative test in `test/secrets.test.ts`.
3. Verify redaction works: any match must be removed by `redactSecrets`.

## Adding dangerous-command rules

Rules live in `src/detectors/commands.ts`. Prefer narrow patterns with clear risk levels:

- `critical`: irreversible or remote-code-execution patterns → always denied
- `high`: privilege escalation, destructive-but-recoverable → approval required
- `medium`: suspicious but common (e.g., dumping environment variables) → recorded, scored

Add tests in `test/commands.test.ts`, including a safe command that must NOT match.

## Policy changes

The policy format is validated in `src/core/policy.ts` with strict errors. If you add a field:

1. Extend the validator with a helpful error message.
2. Update the template emitted by `agentguard init`.
3. Document it in the README security model section.

## Design principles

1. **Honesty over features.** Never claim protection the code does not provide. If a capability is partial, say exactly what it covers.
2. **Secure defaults.** Non-interactive sessions deny actions that would require approval; unknown policy fields fail validation loudly.
3. **Local-first privacy.** No network calls, no telemetry, ever. If a feature needs the network, it must be opt-in and documented.
4. **Deterministic security decisions.** No opaque scoring; every decision cites its rule IDs and reasons.
5. **Secrets never touch disk unredacted.** Redaction happens before serialization.

## Pull requests

- Keep PRs focused; one feature or fix per PR.
- Run `npm test` before pushing.
- Update CHANGELOG.md under "Unreleased".
- New features need tests; bug fixes need a regression test.

## Reporting vulnerabilities

See [SECURITY.md](SECURITY.md). Please do not open public issues for security problems.
