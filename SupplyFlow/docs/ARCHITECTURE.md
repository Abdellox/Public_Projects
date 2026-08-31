# Architecture

SupplyFlow is a **modular monolith**: one deployable Next.js application backed by PostgreSQL, with strict internal boundaries so modules can be extracted later if needed. No microservices, no message broker required to run.

## High-level layout

```
┌────────────────────────────────────────────────────┐
│ apps/web (Next.js App Router)                      │
│  • React UI (spreadsheet-style grids)              │
│  • API routes under /api/*  ← the only DB callers  │
└──────────────┬─────────────────────────────────────┘
               │ imports
┌──────────────▼─────────────────────────────────────┐
│ packages/                                          │
│  database   Drizzle schema + business engines      │
│             (inventory, planning, alerts, audit)   │
│  auth       password hashing + sessions            │
│  validation Zod schemas shared client/server       │
│  types      RBAC matrix + domain types             │
└──────────────┬─────────────────────────────────────┘
               │
        ┌──────▼──────┐
        │ PostgreSQL  │
        └─────────────┘
```

## Key decisions

### 1. Server is the source of truth
Every mutation goes through an API route that:
1. Authenticates the session (`requireUser`) — see `apps/web/src/lib/server/api.ts`
2. Checks the RBAC permission (`hasPermission(role, permission)` from `@supplyflow/types`)
3. Validates input with a Zod schema from `@supplyflow/validation`
4. Runs the write inside a transaction where correctness matters (inventory movements)
5. Writes an immutable `audit_logs` row

The UI never computes permissions or quantities; it renders server responses.

### 2. Inventory correctness lives in one function
`applyMovement()` in `packages/database/src/services/inventory.ts` is the single writer of stock levels:

```
movement row (immutable, signed direction)  →  inventory upsert (transactional)
```

Adjustments, receipts, shipments and transfers all funnel through it. This makes stock auditable: current quantity is always derivable by replaying movements.

**Known MVP tradeoff:** reserved quantity decrements when goods ship, and incoming supply counts `max(open ASN qty, open PO qty)` per product rather than a precise reservation model. Documented in DATABASE.md.

### 3. Planning & alerts are computed, not stored
- **Planning rows** are calculated on request (`services/planning.ts`): `projected = on_hand − reserved + incoming − forecast_demand`. Demand uses user forecasts when present, else trailing-30-day shipped volume.
- **Alerts** are derived views over POs, ASNs and stock positions (`services/alerts.ts`). Nothing to stale-rotate, nothing to drift.

Both return *explanations* (why-it-matters, suggested action) because recommendations are never auto-executed — creating a PO always requires explicit approval.

### 4. Multi-tenancy by scoping, not schemas
One database, every table carries `organization_id`, every query filters by the caller's org from the session. Indexes lead with `organization_id`. There is no code path that accepts an org id from the client for writes.

### 5. Extensibility hooks in the schema
`custom_tables` / `custom_columns` / `custom_records` provide Excel-like user-defined fields without migrations. The MVP UI does not expose them yet; the storage contract exists so module work can build on it.

## Request lifecycle example

Creating a purchase order:

```
POST /api/v1/purchase-orders
  → requirePermission("purchase_orders.write")
  → createPurchaseOrderSchema.parse(body)          # zod
  → nextNumber(tx, "PO")                            # PO-2026-001
  → INSERT purchase_orders + lines                  # transaction
  → logAudit("purchase_order.created")              # who/what/when
  → 201 { data: { id, number, ... } }
```

Status transitions (`draft → sent → confirmed → received/cancelled`) are validated server-side in `/api/v1/purchase-orders/[id]/status`; illegal jumps return 409.

## What we deliberately skipped (for now)

See ROADMAP.md: background jobs (Redis is wired via env but unused), MFA enforcement, S3 document uploads, AI features, custom-tables UI.
