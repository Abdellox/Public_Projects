# Pull request

## What does this PR do?

<!-- One or two sentences. Link related issues with "Fixes #123". -->

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (unit; integration if DB available)
- [ ] Schema changes include a generated migration (`db:generate`), not `push`
- [ ] New/changed endpoints enforce permissions server-side and have tests
      including a cross-tenant 404 case
- [ ] Audit logging added for significant mutations
- [ ] No secrets, no fake buttons, no dead links
- [ ] Docs updated (README / docs/) when behavior or setup changes

## Multi-tenancy impact

Does this change touch tenant-scoped data? If yes, describe how isolation is
preserved and which test proves it.
