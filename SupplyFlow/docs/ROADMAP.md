# Roadmap

SupplyFlow follows the product spec's phased plan. Status as of v0.1:

## ✅ Phase 1 — Foundation (shipped)

- Multi-tenant workspaces, RBAC (6 roles), session auth
- Products, variants, suppliers, warehouses, locations, customers
- Purchase orders with status lifecycle + auto numbering
- Inbound shipments (ASN), receiving with partial receipts → PO completion
- Customer orders, outbound shipments (ship/deliver)
- Inventory ledger with adjustments and transfers
- Spreadsheet-style editable grids everywhere
- CSV/XLSX import wizard (map → preview → per-row report) and exports
- Planning engine (projected stock, risk levels, reorder suggestions → draft PO approval)
- Computed alerts with why-it-matters + suggested action
- Dashboard KPIs, supplier scorecards
- Comments with @mentions, tasks, notifications, audit log

## 🔨 Phase 2 — Hardening (next)

- [ ] Integration test suite against Postgres (receiving, shipping, transfer flows end-to-end)
- [ ] Rate limiting on auth endpoints; account lockout backoff
- [ ] MFA (TOTP) — schema ready (`mfaSecret`), needs enrollment UI + login challenge
- [ ] Background jobs on Redis: email notifications, scheduled report digests
- [ ] S3-compatible document attachments on POs/ASNs/orders (schema ready)
- [ ] Custom fields UI on top of `custom_tables`/`custom_columns`
- [ ] Saved views per user per module (filters + column pinning persisted)

## 🧭 Phase 3 — Depth

- [ ] Demand forecasting upgrade: seasonality-aware suggestions (moving beyond trailing averages)
- [ ] Multi-warehouse allocation rules for order routing
- [ ] Supplier portal (read-only PO view + confirm/ship updates)
- [ ] Landed-cost tracking on receipts
- [ ] Lot/batch & expiry tracking for regulated goods
- [ ] Webhooks + REST API tokens for integrations
- [ ] i18n scaffolding (string extraction), starting with the planning module

## 🌍 Phase 4 — Community scale

- [ ] Plugin system for custom modules (custom tables already provide storage)
- [ ] Report builder (pivot-style, exportable)
- [ ] Marketplace of import templates per industry
- [ ] Optional hosted tier funding OSS development

## Non-goals (for now)

- Accounting / general ledger — integrate instead (webhooks in Phase 3)
- Native mobile apps — responsive web first
- Real-time collaborative editing (OT/CRDT) — optimistic inline save is sufficient for MVP
