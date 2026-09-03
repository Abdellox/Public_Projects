# BUSINEX — The Universal Open Business Platform

> **One Platform. Every Business. One Shared Business Model.**
> **No Unnecessary Duplication.**

BUSINEX is a global, open-source, modular business platform that supports
organizations of **any size, structure, industry, and country** — from a
freelancer or small company to a multinational enterprise.

It unifies business management into **one coherent platform** instead of many
disconnected applications:

> **ONE PLATFORM — ONE ORGANIZATION MODEL — ONE SHARED DATA MODEL — MANY BUSINESS CAPABILITIES.**

The architecture eliminates unnecessary duplication between CRM, ERP, HR,
finance, POS, inventory, procurement, warehouse, logistics, helpdesk, booking,
workforce management and enterprise modules — because they all build on the
same foundation.

---

## Why BUSINEX?

Traditional business software ships separate products: a CRM here, an ERP
there, a POS in another place. Each duplicates customers, products, users and
workflows. BUSINEX rejects that:

- **One canonical `Party`** is a customer, supplier, partner or employee — never
  `CRMCustomer` / `HelpdeskCustomer` / `POSCustomer`.
- **One canonical `Product`** is sold, stocked, purchased and accounted for —
  never `SalesProduct` / `InventoryProduct` / `WarehouseProduct`.
- **One hierarchical Organization model** supports freelancers to multinational
  groups — never one-user-one-company assumptions.
- **One workflow engine** drives `Invoice → Paid` for a small business and a
  full approval chain for an enterprise — the same Invoice entity.

---

## Architecture at a glance

BUSINEX is a **modular monolith**: one deployable application with clean,
schema-per-module boundaries, reusable shared packages, an in-process event bus,
and centralized cross-cutting capabilities. This gives the simplicity of a
monolith today and the optionality to extract modules as services later — the
defensible 2026 architecture for a platform like this.

```
apps/
  api/          Hono + @hono/node-server REST API (module host)
  web/          Next.js web app (one unified UI)
packages/
  types/        Universal core data model (shared types, module registry)
  config/       Validated environment configuration
  validation/   Zod schemas for every API input
  lib/          Ids, money, security, event bus, errors
  auth/         Centralized identity + authorization (RBAC, permissions)
  ui/           One design system used by every module
  database/     Drizzle Postgres schema (schema-per-module) + seed
modules/
  identity/     Authentication & single sign-in
  organization/ Universal org tree, legal entities, locations
  party/        Canonical Party + roles, contacts, employees
  catalog/      Universal product catalog + prices
  workflow/     Reusable workflow/approval engine
  audit/        Immutable audit trail
  notification/ Notification hub
  document/     Centralized documents & files
  crm/          Leads, opportunities, quotes, sales orders
  invoicing/    Invoices with configurable workflow + payments
  inventory/    Stock, movements, purchase orders
  pos/          Point of sale orders
```

---

## Getting started

### Prerequisites

- Node.js >= 20.11 and npm
- Docker (for Postgres/Redis) — or any local Postgres 16

### 1. Clone and install

```bash
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/Busniex
npm install
```

### 2. Start the database

```bash
npm run docker:up          # starts Postgres on :5432 and Redis on :6379
cp .env.example .env       # then adjust DATABASE_URL etc. as needed
```

### 3. Push schema and seed

```bash
npm run db:push            # apply the Drizzle schema to Postgres (no local pg needed for this)
npm run db:seed            # create the demo 'acme' tenant, user, parties, products
```

> Alternative: generate & apply SQL migrations with `npm run db:generate` and
> `npm run db:migrate`.

### 4. Run the platform

```bash
npm run dev                # API on :4000 and Web on :3000 (concurrently)
```

Open **http://localhost:3000** and sign in with:

```
Email:    admin@businex.dev
Password: Demo1234!
```

The REST API is at **http://localhost:4000** with metadata at `/health` and `/modules`.

---

## Example API calls

```bash
# Health
curl localhost:4000/health

# Login -> returns a JWT
curl -X POST localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@businex.dev","password":"Demo1234!"}'

# List parties (authenticated)
curl localhost:4000/parties -H "Authorization: Bearer <token>"

# Create an invoice (starts in 'draft')
curl -X POST localhost:4000/invoices -H "Authorization: Bearer <token>" \
  -H 'Content-Type: application/json' \
  -d '{"currency":"USD","lineItems":[{"description":"Widget","quantity":2,"unitPrice":10}]}'

# Move the invoice through its workflow: draft -> completed
curl -X POST localhost:4000/invoices/<id>/transition -H "Authorization: Bearer <token>" \
  -H 'Content-Type: application/json' -d '{"to":"completed"}'

# Read the audit trail
curl localhost:4000/audit -H "Authorization: Bearer <token>"
```

---

## Configuration over duplication

Organizations configure fields, workflows, approval chains, statuses, numbering,
permissions, dashboards, forms and notifications — preferring configuration and
extensions over forking the platform. Every module reuses the same identity,
permissions, workflow, audit, notification, document and API infrastructure.

---

## Roadmap

- [x] Universal core data model, organization model, workflow engine, audit, identity
- [x] CRM, Invoicing, Inventory & Procurement, POS as built-on modules
- [ ] Helpdesk, Booking, HR/Payroll, Accounting/GL, BI — as modules on the same core
- [ ] Industry extension system (retail, manufacturing, healthcare, ...)
- [ ] Multi-currency, multi-country localization & compliance modules
- [ ] Plugin/extension architecture and developer SDKs

See the [docs](./docs) for architecture and contribution details.

---

## Contributing

BUSINEX is a community project. Please read
[CONTRIBUTING.md](./CONTRIBUTING.md) and our
[Code of Conduct](./CODE_OF_CONDUCT.md), then open an issue or a pull request.

Use the issue templates for
[bug reports](./.github/ISSUE_TEMPLATE/bug_report.md) and
[feature requests](./.github/ISSUE_TEMPLATE/feature_request.md). Remember the
core rule: **save before you build — reuse before you duplicate.**

---

## License

BUSINEX is licensed under the [Apache License 2.0](./LICENSE).

---

## Vision

> **ONE global open-source business platform for every organization.**
> One platform. Every business. No unnecessary duplication.
