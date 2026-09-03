# Contributing to BUSINEX

Thanks for considering contributing to BUSINEX — the Universal Open Business
Platform. Every contribution matters, whether it is code, documentation,
templates, tests, or ideas.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Architecture first](#architecture-first)
- [Getting started](#getting-started)
- [How to contribute](#how-to-contribute)
  - [Report a bug](#report-a-bug)
  - [Request a feature module](#request-a-feature-module)
  - [Send a pull request](#send-a-pull-request)
- [Development guide](#development-guide)
- [Good first tasks](#good-first-tasks)
- [License](#license)

## Code of conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). Be
respectful, constructive, and welcoming.

## Architecture first

BUSINEX's core rule is **no unnecessary duplication**. Before adding any
feature, ask:

1. Does an existing entity already represent this? (Party, Product, OrganizationUnit…)
2. Can an existing service be reused? (workflow, audit, notification, documents…)
3. Does another module need the same capability?
4. Can this be configuration instead of duplicated code?
5. What workflow does it belong to?
6. What permissions does it require?
7. What audit events must it produce?
8. What API should expose it?
9. Can another industry reuse it?

If your feature adds a new concept that duplicates an existing one, expect a
review discussion about reusing the universal model instead.

## Getting started

```bash
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/Busniex
npm install
npm run docker:up
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

## How to contribute

### Report a bug

Open a [bug report](./.github/ISSUE_TEMPLATE/bug_report.md) with steps to
reproduce, expected behaviour, and environment details.

### Request a feature module

Open a [feature request](./.github/ISSUE_TEMPLATE/feature_request.md) and
explain how it reuses the universal model (see "Architecture first").

### Send a pull request

1. Create a branch: `git checkout -b feat/my-feature`.
2. Keep changes inside your feature's scope and the shared packages it needs.
3. Run the checks locally:

   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

4. Open a PR using the [template](./.github/pull_request_template.md).
5. A maintainer will review; keep the module boundaries clean.

## Development guide

See [AGENTS.md](./AGENTS.md) for commands and architecture rules, and the
[docs](./docs) for deeper explanations of each subsystem.

## Good first tasks

- Write vitest unit tests for `@businex/lib` helpers.
- Improve the seeded demo data in `packages/database/src/seed.ts`.
- Add a helpdesk or booking module reusing the canonical Party/Product/workflow.
- Document an API endpoint in the docs.
- Add accessibility or localization passes to the web UI.

## License

By contributing you agree that your contributions are licensed under the
[Apache License 2.0](./LICENSE).
