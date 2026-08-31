# Contributing to SupplyFlow

Thanks for helping build a better supply-chain workspace! This guide covers everything you need to contribute effectively.

## Code of Conduct

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting started

1. **Fork & clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/supplyflow.git
   cd supplyflow
   npm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env
   docker compose up -d        # Postgres + Redis
   npm run db:migrate
   npm run db:seed             # demo data for local dev
   ```

3. **Verify your setup**

   ```bash
   npm run typecheck && npm run lint && npm test
   ```

## How we work

### Branching

- `main` is always deployable.
- Feature branches: `feat/<short-name>` (e.g. `feat/po-kanban-view`)
- Bug fixes: `fix/<short-name>`
- Chores/docs: `chore/...`, `docs/...`

### Commits

We follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat(planning): add reorder recommendation approval flow
fix(inventory): prevent negative available stock on transfers
docs(readme): clarify self-hosted quick start
```

Scopes map to modules: `products`, `inventory`, `purchasing`, `shipments`, `orders`, `planning`, `suppliers`, `auth`, `ui`, `db`, `infra`.

### Pull requests

- Keep PRs focused; one feature or fix per PR.
- Fill out the PR template completely.
- Add or update tests for any behavior change.
- Update documentation when adding/changing features.
- Ensure CI passes: typecheck, lint, unit, integration, build.

**Definition of done** for every feature:

> Database → Backend → Authorization → API → UI → Tests → Documentation

No fake screens. No buttons that do nothing.

## Architecture guidelines

- **Modular monolith**: features live in their own modules; don't reach across module internals — use exported service APIs.
- **Multi-tenant safety**: every query must be scoped by `organizationId`. Server-side authorization is mandatory; never trust the client.
- **Derived data**: stock projections and supplier metrics are computed from movements/orders — never stored as manually-editable truth.
- **Explainable intelligence**: recommendations must show their math. AI proposes, humans approve.

## Testing

| Type | Tool | Location |
| --- | --- | --- |
| Unit / integration | Vitest | `tests/` and colocated `*.test.ts` |
| E2E | Playwright | `tests/e2e/` |

```bash
npm test            # unit + integration
npm run test:e2e    # Playwright suite (needs running app)
```

## Reporting issues

- **Bugs**: use the bug report template. Include reproduction steps, expected vs actual, environment.
- **Features**: use the feature request template. Explain the *problem* first, then the proposed solution.
- **Security vulnerabilities**: do NOT open public issues. See [SECURITY.md](SECURITY.md).

## Review process

1. A maintainer triages and reviews your PR.
2. Address feedback with new commits (no force-push mid-review).
3. Squash-merge on approval; commit message follows Conventional Commits.

## Areas that need help

Check issues labeled `good first issue` or `help wanted`. High-value areas right now: table UX polish, import edge cases, supplier scorecard tests, docs translations.
