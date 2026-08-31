# Database

PostgreSQL 16+, accessed through [Drizzle ORM](https://orm.drizzle.team). Schema source of truth: `packages/database/src/schema/core.ts`.

## Conventions

| Convention | Choice |
|---|---|
| Primary keys | `uuid` with `defaultRandom()` |
| Money | `numeric(14,2)` — **string in JS**; convert with `num()` helper (`packages/database/src/util.ts`) |
| Quantities | `double precision` |
| Timestamps | `timestamp with time zone`, `defaultNow()` |
| Soft delete | `deletedAt timestamptz null` on main entities |
| Tenancy | every table has `organization_id` (FK → organizations), indexed first |

## Entity map

```
organizations ─┬─ memberships ── users ── sessions
               ├─ categories ── products ── product_variants
               ├─ suppliers
               ├─ warehouses ── locations
               ├─ purchase_orders ── purchase_order_lines
               ├─ inbound_shipments ── inbound_shipment_lines
               ├─ customers ── customer_orders ── customer_order_lines
               ├─ outbound_shipments ── outbound_shipment_lines
               ├─ inventory ── inventory_movements
               ├─ demand_forecasts
               ├─ stock_transfers ── stock_transfer_lines
               ├─ activities · comments · tasks · notifications · documents
               ├─ custom_tables ─ custom_columns ─ custom_records
               └─ audit_logs
```

### Inventory

- `inventory` — one row per `(organization, product_variant, warehouse)`: `quantityOnHand`, `quantityReserved`, `reorderPoint`.
- `inventory_movements` — append-only ledger. Direction is derived from the movement type enum (`receipt`/`adjustment_increase`/`transfer_in` positive; `shipment`/`adjustment_decrease`/`transfer_out` negative). Current stock = sum of movements; `applyMovement()` keeps both consistent inside one transaction.

### Purchasing flow

`purchase_orders.status`: `draft → sent → confirmed → received | cancelled`
`inbound_shipments.status`: `expected → in_transit → received | cancelled`

Receiving an ASN increments `purchase_order_lines.quantityReceived`; when all lines are fully received the PO flips to `received`. Partial receipts are allowed.

### Sales flow

`customer_orders.status`: `draft → confirmed → processing → shipped → delivered | cancelled`
`outbound_shipments.status`: `pending → picking → packed → shipped → delivered`

Shipping decrements on-hand and releases reservations via `applyMovement(shipment)`.

## Document numbering

`nextNumber(tx, prefix)` in `packages/database/src/numbering.ts` produces `{PREFIX}-{YEAR}-###` (e.g. `PO-2026-001`). It counts existing rows for the org+year inside the same transaction; concurrent inserts rely on the unique constraint + retry at the app layer.

## Documented tradeoffs

1. **Incoming supply** counts `max(open ASN qty, open PO qty)` per product — avoids double-counting the same replenishment without a full reservation model.
2. **Reserved** is incremented when a customer order ships from a warehouse with stock; it does not yet reserve at order-confirm time.
3. **Supplier scorecards** derive from completed inbound shipments only (on-time rate, average delay days).

These are safe simplifications, each isolated in one service function so they can be upgraded independently.

## Migrations

```bash
npm run db:generate   # drizzle-kit generate from schema changes
npm run db:migrate    # apply pending migrations
npm run db:push       # dev shortcut: push schema directly
npm run db:seed       # demo org "Acme Outdoors" with realistic data
```

Migration files live in `packages/database/drizzle/`. Never edit applied migrations; always generate a new one.

## Demo credentials (after seed)

| User | Email | Password | Role |
|---|---|---|---|
| Admin | admin@demo.supplyflow.dev | admin1234 | owner |
| Maria (buyer) | maria@demo.supplyflow.dev | buyer1234 | buyer |
| Ken (warehouse) | ken@demo.supplyflow.dev | wh12345 | manager |
