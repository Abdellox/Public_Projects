# SupplyFlow

> **Plan better. Stock smarter. Deliver on time.**

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-green.svg)](https://nodejs.org)

SupplyFlow is an open-source, collaborative supply-chain management platform. It combines **Excel-like flexibility**, **supply-chain intelligence**, and **team collaboration** in one connected workspace — so teams can stop juggling spreadsheets, emails, WhatsApp threads, and PDFs.

---

## Why SupplyFlow?

Excel is powerful because it's flexible. But plain spreadsheets are **not connected** to your supply-chain process. Teams lose track of:

- What they have, what they need, what's coming
- What suppliers promised vs. actually delivered
- What is late, what is at risk, what should be reordered
- How much money is committed and to whom
- Who is responsible for an issue

SupplyFlow connects all of it:

```
PRODUCTS → SUPPLIERS → PURCHASE ORDERS → INBOUND SHIPMENTS
    ↓                                              ↓
INVENTORY ← WAREHOUSES ← TRANSFERS          DELIVERY
    ↑                                              ↑
CUSTOMER ORDERS ← DEMAND PLANNING ← OUTBOUND SHIPMENTS
```

Change a purchase order, and inventory planning, expected arrivals, and reorder recommendations update accordingly. That's the difference.

## Features

### Core modules
| Module | What you get |
| --- | --- |
| **Products** | SKUs, variants, categories, cost/price, min/max stock, reorder points, custom fields |
| **Suppliers** | Contacts, terms, lead times, documents, performance scorecards |
| **Inventory** | Per-warehouse stock, reserved/incoming/damaged quantities, full movement history |
| **Warehouses** | Multiple warehouses with locations and inter-warehouse transfers |
| **Purchase orders** | Draft → Sent → Confirmed → Partially received → Received lifecycle |
| **Inbound shipments** | Tracking, carriers, expected vs. actual arrival, delay visibility |
| **Customer orders** | Priorities, required dates, fulfillment status per warehouse |
| **Outbound shipments** | Carrier tracking, delivery dates, order linkage |

### Intelligence
- **Supply planning** — current stock − reserved + incoming − forecast demand = projected stock, per product
- **Reorder recommendations** — explained, reviewable, never auto-executed
- **Demand planning** — transparent forecasts (history + manual), no black boxes
- **Alerts** — actionable ("Product may run out in 12 days", "Shipment is late") with what/why/what-to-do
- **Supplier scorecards** — on-time %, average delay, defect rate computed from real data

### Experience
- **Spreadsheet-grade tables** — inline editing, keyboard shortcuts, sort/filter/group, frozen & pinned columns
- **Multiple views** — table, kanban, calendar, dashboard
- **Collaboration** — comments, mentions, tasks, notifications, activity timelines on every record
- **Global search** across all entities
- **Import/export** — guided CSV/XLSX import with column mapping, validation, duplicate detection; audited exports
- **Custom tables** — model your own workflows (contracts, inspections, packaging) safely
- **AI assistant** *(optional)* — ask questions about *your authorized data*; provider-agnostic; recommends, humans approve

### Platform
- Multi-tenant with strict isolation
- Role-based access control, server-side authorization everywhere
- Audit logs on every sensitive action
- Cloud or self-hosted — same core product

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | TypeScript modular monolith (Next.js API layer) |
| Database | PostgreSQL + Drizzle ORM |
| Cache / jobs | Redis (optional locally, required for production) |
| Object storage | S3-compatible |
| Auth | Session-based, MFA-ready, argon2id password hashing |
| Testing | Vitest (unit/integration), Playwright (e2e) |
| Infrastructure | Docker Compose, GitHub Actions CI |

A modular monolith by design — no unnecessary microservices.

## Quick start (self-hosted)

Prerequisites: Node 20+, Docker (or a local PostgreSQL 15+).

```bash
# 1. Clone
git clone https://github.com/YOUR_ORG/supplyflow.git
cd supplyflow

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start infrastructure (Postgres + Redis)
docker compose up -d

# 5. Run migrations & seed demo data
npm run db:migrate
npm run db:seed

# 6. Start developing
npm run dev
```

Open http://localhost:3000 and sign in with the seeded admin account (see seed output).

### Production (Docker)

```bash
docker compose -f docker-compose.prod.yml up -d --build
npm run db:migrate   # against your DATABASE_URL
```

## Repository layout

```
apps/
  web/                 # Next.js app (UI + API routes)
packages/
  database/            # Drizzle schema, migrations, queries
  auth/                # Sessions, passwords, RBAC policies
  types/               # Shared TypeScript types
  validation/          # Zod schemas shared client/server
  imports/ exports/    # CSV/XLSX pipelines
  search/ ai/ ui/      # Feature packages
infrastructure/        # Dockerfiles, compose files
docs/                  # Architecture, API, deployment guides
tests/                 # Cross-cutting test suites
```

## Documentation

- [Architecture overview](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE.md)
- [API reference](docs/API.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Local development](docs/DEVELOPMENT.md)
- [Security policy](SECURITY.md)
- [Contributing guide](CONTRIBUTING.md)

## Project principles

1. **Solve real daily problems first.** Replace messy spreadsheets before chasing enterprise checklists.
2. **Connected, not isolated.** Data flows through the chain; calculations are derived, never re-typed.
3. **Transparent intelligence.** Every recommendation explains its math. AI advises; humans decide.
4. **Secure by default.** Tenant isolation, RBAC, audit logs — from day one.
5. **Fast at scale.** Virtualized tables, cursor pagination, indexed queries. Tens of thousands of rows stay smooth.
6. **Genuinely open source.** Clone it, run it, own your data.

## Roadmap

- [x] MVP: core entities, auth, RBAC, tables, planning basics, alerts, import/export
- [ ] Kanban & calendar views, custom tables v1
- [ ] Realtime collaboration (presence, live cells)
- [ ] Semantic search, advanced forecasting
- [ ] Billing abstraction for cloud plans
- [ ] Mobile-responsive polish & PWA

See [docs/ROADMAP.md](docs/ROADMAP.md) for details and [open issues](../../issues) to contribute.

## Contributing

We welcome contributions! Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started. Good first issues are labeled [`good first issue`](../../issues?q=label%3A"good+first+issue").

## License

SupplyFlow is open source under the [AGPL-3.0 license](LICENSE). Commercial licensing available for organizations that cannot use AGPL — open an issue to discuss.

---

<div align="center">
<strong>Plan better. Stock smarter. Deliver on time.</strong>
</div>
