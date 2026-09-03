# Adding a module

BUSINEX is designed to be extended by adding modules that reuse the universal
core. This guide walks through adding a new business module (for example, a
Booking or Helpdesk module).

## Steps

1. **Reuse first.** Ask: which canonical entities does this use? Nearly every
   module needs `Party` (customers/suppliers/employees), `Product`, and
   `OrganizationUnit`. Plan to reference them, not duplicate them.

2. **Add a schema.** Put the new tables in
   `packages/database/src/schema/<module>.ts` and export them from
   `packages/database/src/schema/index.ts`. Follow the conventions
   (`timestamps`, `tenantId` foreign key, `entityType` discriminator).

3. **Add types.** Add shared TypeScript types to `@businex/types` and Zod
   schemas to `@businex/validation`.

4. **Create the module package.**

   ```
   modules/<name>/
     package.json     # name: @businex/module-<name>
     src/index.ts     # register(db, parentHono) + ModuleDescriptor
   ```

   Depend on `@businex/auth`, `@businex/database`, `@businex/lib`,
   `@businex/types`, `@businex/validation` and any shared modules you use
   (e.g. `@businex/module-audit` for `writeAudit`).

5. **Write the router.** Guard routes with `requireAuth` + `requirePermission`.
   Use the workflow engine for lifecycle state, `writeAudit` for audit events,
   and `notify` for notifications instead of reimplementing them.

6. **Wire it into the API.** In `apps/api/src/index.ts`:
   - add the dependency to `apps/api/package.json`
   - import `register` + `descriptor` from your module
   - mount `requireAuth` on the route namespace (unless it is public)
   - call `register(db, app)` and add its `descriptor` to the `modules` list

7. **Seed demo data.** Extend `packages/database/src/seed.ts` so the module has
   data to show locally.

8. **Verify.** `npm run typecheck && npm run lint && npm test`.

## Module contract

Every module exposes:

```ts
export function register(db: BusinexDb, parent: Hono): void;
export const descriptor: ModuleDescriptor; // id, name, group, permissions, enabled
```

The unified web UI renders module pages; add a page under `apps/web/src/app` and
a nav entry in `apps/web/src/components/Shell.tsx` to surface the module.
