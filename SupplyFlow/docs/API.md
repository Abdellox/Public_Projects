# API

All endpoints live under `/api` in the Next.js app. JSON in/out. Authentication is the `sf_session` httpOnly cookie (30-day sessions).

## Conventions

- Success: `{ "data": ... }` with 200/201
- Error: `{ "error": { "message": string } }` with a meaningful status:
  - `400` validation · `401` unauthenticated · `403` missing permission · `404` not found / wrong org · `409` illegal state transition
- List endpoints accept `?limit=&offset=&q=` (search where supported) and return `{ data: [...], total? }`
- Every mutating endpoint writes an audit log entry

## Auth

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | Body: `{ name, email, password, intent?, organizationName?, currency?, timezone? }`. With `intent: "create-org"` creates org + owner membership atomically |
| POST | `/api/auth/login` | Sets session cookie |
| POST | `/api/auth/logout` | Clears session |

## Core entities

Standard CRUD for `products`, `suppliers`, `warehouses`, `customers`:

```
GET    /api/v1/{entity}?limit&offset&q
POST   /api/v1/{entity}
GET    /api/v1/products/{id}
PATCH  /api/v1/products/{id}
DELETE /api/v1/products/{id}        # soft delete
```

Required permissions per entity: `.read` for GET, `.write` for mutations (e.g. `products.read`, `suppliers.write`).

## Purchasing

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET/POST | `/api/v1/purchase-orders` | `.read` / `.write` | POST accepts full line set; number auto-assigned (`PO-YYYY-###`) |
| GET/PATCH/DELETE | `/api/v1/purchase-orders/{id}` | `.read` / `.write` | PATCH replaces lines while status = draft |
| POST | `/api/v1/purchase-orders/{id}/status` | `.write` | Body `{ action: "send" \| "confirm" \| "cancel" }`; validated transition, 409 on illegal |

## Inbound

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/v1/inbound-shipments` | ASN numbers auto-assigned; optional `purchaseOrderId` link |
| GET/PATCH | `/api/v1/inbound-shipments/{id}` | |
| POST | `/api/v1/inbound-shipments/{id}/receive` | Body: array of `{ productId, quantityReceived, locationId? }`. Applies receipt movements, increments PO received qty, completes PO when fully received |

## Sales & outbound

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/v1/customer-orders` | SO numbers auto-assigned |
| GET/PATCH | `/api/v1/customer-orders/{id}` | |
| GET/POST | `/api/v1/outbound-shipments` | Can link a customer order |
| POST | `/api/v1/outbound-shipments/{id}/action` | Body `{ action: "ship" \| "deliver" }`; ship applies stock decrement + releases reservations |

## Inventory & intelligence

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/inventory` | Aggregated stock across warehouses |
| POST | `/api/v1/inventory` | Body `{ kind: "adjust" \| "transfer", ... }` → movements |
| GET | `/api/v1/inventory/movements` | Ledger, newest first |
| GET | `/api/v1/planning` | Per-product positions + supplier scorecards |
| POST | `/api/v1/planning/approve-reorder` | Body `{ supplierId, warehouseId?, expectedDate?, items: [{ productId, quantity }] }` → creates **draft** PO |
| GET | `/api/v1/alerts` | Computed alert list with why-it-matters + suggested action |
| GET | `/api/v1/dashboard` | KPIs, top risk products, latest alerts, supplier performance |

## Collaboration

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/v1/tasks` · PATCH/DELETE `/api/v1/tasks/{id}` | `mentions` field notifies users |
| GET | `/api/v1/notifications` · POST mark-read | |
| GET/POST | `/api/v1/comments` | Body includes `entityType`, `entityId`, `body`, `mentions` |

## Workspace & data portability

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET/PATCH | `/api/v1/org` | read: any member · write: `org.manage` | `GET ?view=audit&limit=` requires `audit.read` |
| GET/POST/PATCH | `/api/v1/team` | `members.read` / `members.manage` | POST invites (returns temp password if you supplied one); PATCH changes role |
| POST | `/api/v1/import/parse` | `.write` on entity | multipart file → columns + preview rows (max 2000) |
| POST | `/api/v1/import/commit` | `.write` | Mapped rows → per-row created/updated/skipped/error report |
| GET | `/api/v1/export?entity=…&format=csv\|xlsx` | `.read` | Audited |

## Rate limiting / pagination

MVP ships without rate limits (self-hosted trust boundary). Lists default to sensible caps; import is capped at 2000 rows / 8 MB.
