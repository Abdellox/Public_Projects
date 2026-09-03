# Contributing to PeopleFlow

First off, thank you! 🎉 PeopleFlow is a community effort and every contribution helps —
code, documentation, design, bug reports and feature ideas.

## Getting started

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Set up your development environment ([docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)):
   ```bash
   pnpm install
   cp .env.example .env
   docker compose up -d postgres
   pnpm db:migrate && pnpm db:seed
   pnpm dev
   ```
3. Make your change with focused commits.
4. Before opening a PR, run the full check suite:
   ```bash
   pnpm typecheck && pnpm lint && pnpm test && pnpm build
   ```

## Branch naming

* `feat/…` — new features
* `fix/…` — bug fixes
* `docs/…` — documentation
* `refactor/…` — code changes that neither fix bugs nor add features
* `chore/…` — tooling, CI, dependencies

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(leave): add team calendar view
fix(auth): lock sessions to organization membership
docs: document S3 storage configuration
```

## Pull request guidelines

* Keep PRs small and focused; one feature or fix per PR
* Fill in the PR template completely
* Add or update tests for any behavior change (unit + API tests)
* Update documentation when you change behavior or architecture
* New API endpoints must enforce **server-side authorization**, validate input with Zod
  schemas from `@peopleflow/validation`, and be tenant-scoped via `organizationId`
* Never commit secrets, credentials or real personal data

## Code style

* TypeScript strict mode everywhere — no `any` unless truly unavoidable (and justified)
* Follow existing patterns: routes in `apps/api/src/routes`, business logic in services,
  shared schemas in packages
* The database layer must always filter by `organizationId` for tenant-owned models

## Reporting bugs & proposing features

* Bugs: open a [bug report](https://github.com/peopleflow/peopleflow/issues/new?template=bug_report.md)
* Ideas: open a [feature request](https://github.com/peopleflow/peopleflow/issues/new?template=feature_request.md)
* Security issues: **never** in public — see [SECURITY.md](SECURITY.md)

## Licensing

By contributing, you agree that your contributions will be licensed under the
Apache License 2.0 that covers this project.
