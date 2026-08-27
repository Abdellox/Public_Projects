# Nexora CRM

> **Your customers. Your team. One open platform.**

Nexora CRM is a modern, fast, secure, open-source and fully customizable CRM platform. It helps companies manage customers, leads, contacts, sales pipelines, communication, tasks, teams and business relationships — in one place.

Nexora ships in **two deployment models** built on the same core architecture:

| | ☁️ Cloud | 🖥 Self-Hosted |
|---|---|---|
| **Who it's for** | Teams that want zero setup | Companies & developers who want full control |
| **Setup** | Sign up, create organization, invite your team | Clone, configure, deploy on your own infrastructure |
| **Data** | Managed, isolated, backed up | 100% yours |

---

## Table of Contents

1. [Why Nexora](#1-why-nexora)
2. [Core Modules](#2-core-modules)
3. [Multi-Tenancy](#3-multi-tenancy)
4. [Customization](#4-customization)
5. [AI Assistant](#5-ai-assistant)
6. [Architecture](#6-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Database Design](#8-database-design)
9. [Permission Model](#9-permission-model)
10. [API-First](#10-api-first)
11. [Security](#11-security)
12. [Performance](#12-performance)
13. [Quick Start](#13-quick-start)
14. [Repository Structure](#14-repository-structure)
15. [MVP Scope](#15-mvp-scope)
16. [Roadmap](#16-roadmap)
17. [Open Source](#17-open-source)
18. [License](#18-license)

---

## 1. Why Nexora

Traditional CRMs are expensive, complicated and closed. Nexora is the alternative:

- **Fast** — feels instant, everywhere
- **Beautiful** — a unique, clean, premium interface (not a Salesforce/HubSpot clone)
- **Simple** — powerful without being overwhelming
- **Secure** — tenant isolation and server-side authorization by design
- **Customizable** — fields, pipelines, roles, statuses, views: no code required
- **Extensible** — API-first, webhooks, clean integration interfaces
- **Open source** — genuinely; the self-hosted version is not crippled
- **Developer-friendly** — TypeScript end-to-end, modular monolith, easy to run locally

A new company can: open Nexora → create an organization → invite employees → add customers → move leads through a pipeline → track every interaction → see sales performance → search everything → use AI on their data — all within minutes.

---

## 2. Core Modules

### 📊 Dashboard
Sales overview, open deals, new leads, conversion rate, revenue, tasks, upcoming activities, team performance. **Customizable widgets** — users choose what they see.

### 👤 Contacts
Individual people: name, email, phone, company, job title, tags, owner, status, custom fields, activity history. Search, filter, sort, import/export, bulk actions.

### 🏢 Companies / Accounts
Customer organizations: website, industry, size, location, owner, revenue, tags, custom fields. A company has many contacts.

### 🎯 Leads
Source, status (customizable: New → Contacted → Qualified → Converted…), score, owner, notes, activity tracking.

### 💰 Deals & Pipelines
Kanban + table views. **Multiple custom pipelines** per organization (Sales, Customer Success, Partnerships…) each with custom stages, colors and probabilities. Deals carry value, currency, probability, expected close date, owner, files, activities and tasks.

### 🕐 Activities & Timeline
Calls, emails, meetings, notes, tasks, follow-ups and system events — one complete timeline per customer. *When an employee opens a customer, they understand the entire relationship immediately.*

### ✅ Tasks
Title, due date, priority, assignee, reminders, linked records. List, calendar, "my tasks" and team views.

### 📝 Notes & 📎 Files
Rich-text notes attached to any record. Secure file attachments with type validation, size limits and permission-checked downloads — never predictable public URLs.

### 🔎 Global Search
Contacts, companies, leads, deals, tasks, notes, activities, files — keyword search today, semantic search ready tomorrow. Every result is permission-filtered.

### 📈 Reporting & Analytics
Revenue, won/lost deals, pipeline value, conversion rates, lead sources, sales/team/activity performance — filterable by date, user, team, pipeline, stage and source. Custom-report-ready architecture.

### 🔔 Notifications
In-app + email notifications, task reminders, assignments, mentions — with per-user preferences.

### 📥 Import / Export
CSV import with column mapping, validation, preview, error reporting, duplicate detection and import history. CSV export. Malformed imports can never corrupt existing data.

---

## 3. Multi-Tenancy

```
Platform
├── Organization A   ── users · customers · leads · deals · files · reports
├── Organization B
└── Organization C
```

Organization A must **never** access Organization B's data — customers, messages, files, reports, API responses or AI context.

- Tenant isolation is enforced **on the server**, on every query.
- The frontend is never trusted for security.
- Isolation is proven by automated tests, not convention.

---

## 4. Customization

Customization is a core feature, not an afterthought:

- **Custom fields** on major entities (e.g. "VAT Number", "Contract Value", "Region") via a flexible field system — no database migrations required
- Custom **labels, tags, statuses**
- Multiple **pipelines & stages** with colors and probabilities
- **Roles & permissions** — Owner, Admin, Sales Manager, Support Agent are sensible defaults, but every organization can create its own roles
- **Departments & teams** — org-defined structure
- Saved **views** and dashboard **widgets**

---

## 5. AI Assistant

AI is **optional and modular** — never a dependency, never locked to one provider.

```
AIProvider (abstraction)
├── OpenAI
├── Anthropic
├── Local models (Ollama/vLLM)
└── Future providers
```

Capabilities: summarize customer history, draft emails, suggest follow-ups, extract lead info, natural-language CRM queries ("Which leads haven't been contacted in 14 days?"), pipeline analysis, duplicate detection.

**Authorization is non-negotiable:**

```
✅ User → Permissions → Authorized data → Retrieval → AI context → Response
❌ User → AI → Entire database
```

The model never touches the database directly. Retrieved content is treated as untrusted input (prompt-injection defenses). AI retrieval uses the same policy engine as every other feature.

---

## 6. Architecture

A **modular monolith** — deliberately. No premature microservices; module boundaries keep future extraction cheap.

```
                    ┌────────────────────────────────────┐
                    │           Web Client               │
                    │   SSR + islands · minimal JS       │
                    └─────────────────┬──────────────────┘
                                      │ HTTPS / WSS
                    ┌─────────────────▼──────────────────┐
                    │            API Layer               │
                    │  authn → authz → validation →      │
                    │  routing → rate limiting           │
                    └──────┬─────────┬─────────┬─────────┘
                           │         │         │
              ┌────────────▼──┐ ┌────▼─────┐ ┌─▼──────────┐
              │  CRM modules  │ │ AI layer │ │  Search    │
              │ contacts ·    │ │ provider │ │ keyword →  │
              │ deals · pipes │ │ adapter  │ │ vector     │
              │ activities …  │ │ perm-    │ │ filtered   │
              └──────┬────────┘ │ aware    │ └─┬──────────┘
                     │          └────┬─────┘   │
        ┌────────────▼───────────────▼─────────▼──────────┐
        │            PostgreSQL (source of truth)          │
        ├──────────────────────────────────────────────────┤
        │ Redis: cache · queues · realtime fan-out         │
        │ S3-compatible object storage: files              │
        │ Background workers: imports · indexing · digests │
        └──────────────────────────────────────────────────┘
```

Principles:

- Database is authoritative; events and caches are delivery mechanisms
- Authorization enforced server-side on **every** operation — CRUD, search, files and AI alike
- Modules communicate through explicit interfaces, not shared internals
- Services split only when real scale justifies it

---

## 7. Technology Stack

| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript** everywhere | End-to-end type safety, one language across the stack |
| Frontend | **Next.js + React** | SSR/streaming for fast loads, great DX |
| UI | **Tailwind CSS** + custom Nexora design system (accessible headless primitives) | Original identity, accessibility for free |
| Backend | Node.js modular monolith | Simplest deployable unit; clean seams for later extraction |
| Database | **PostgreSQL** | Relational integrity, JSONB for custom fields, FTS baseline |
| Cache / queues / realtime state | **Redis** | Proven, right-sized |
| Files | S3-compatible storage (MinIO locally) | Standard, self-hostable |
| Search | PostgreSQL FTS → dedicated engine behind `SearchProvider` when needed | No premature infra |
| AI | `AIProvider` abstraction | No vendor lock-in |
| Validation | Zod shared schemas | Single source of truth for contracts |
| Auth | Argon2id hashing, MFA-ready sessions | Secure by default |
| Testing | Vitest + Playwright | Fast feedback + browser confidence |
| Infra | Docker, GitHub Actions CI/CD | Reproducible dev → prod |

> Alternatives may be adopted where justified — documented as ADRs in `/docs`.

---

## 8. Database Design

Core entities (migrations-first, proper FKs/constraints/indexes, timestamps everywhere, soft deletion where appropriate):

```
organizations            tenants — hard isolation boundary
users                    global identity
organization_memberships user ↔ org (role, department, team, title)
departments / teams      org-defined structure
roles / permissions      RBAC + fine-grained, org-definable
contacts                 people
companies                organizations' customers
leads                    pipeline candidates
pipelines                multiple per org
pipeline_stages          ordered, colored, probabilistic
deals                    opportunities in stages
activities               calls · emails · meetings · notes · system events
tasks                    assignable, linkable, remindable
notes                    attachable rich text
files                    object-storage references, permission-checked
tags / taggings          polymorphic taxonomy
custom_fields            per-entity definitions (org-scoped)
custom_field_values      typed values (JSONB-backed)
notifications            per-user inbox
audit_logs               immutable trail
webhooks                 event subscriptions
integrations             connection registry
```

Rules: no unbounded queries, no N+1s, cursor pagination on large collections, indexes matched to real access patterns.

---

## 9. Permission Model

Every protected operation resolves the same chain, server-side:

```
User → Organization membership → Role → Permission → Resource → Action
```

- Roles are org-defined; defaults seeded (Owner, Administrator, Sales Manager, Sales Rep, Marketing, Support Agent, Finance, Employee)
- Permissions are fine-grained and **data-driven — never hardcoded**
- A single reusable policy module serves CRUD APIs, search, file access **and** AI retrieval — one implementation, no drift
- Hidden UI elements are cosmetic only; the server decides everything

---

## 10. API-First

A clean, versioned REST API covering authentication, organizations, users, contacts, companies, leads, deals, pipelines, activities, tasks, notes, files, search, reports, notifications and AI.

Every endpoint provides: authentication, authorization, validation, pagination, filtering, sorting, rate limiting and consistent error envelopes:

```json
{ "error": { "code": "FORBIDDEN", "message": "...", "details": {} } }
```

Webhooks for key events (`contact.created`, `lead.created`, `deal.created`, `deal.won`, `task.completed`…) and clean integration interfaces (email, calendars, messaging, telephony, billing) let contributors build integrations without touching core code.

---

## 11. Security

Foundational, not bolted on:

- Argon2id password hashing — plaintext passwords never stored or logged
- Session management with revocation; MFA-ready architecture
- Hard tenant isolation, proven by regression tests (Org A ≠ Org B)
- Server-side authorization everywhere — including search, files and AI
- Input/output validation (Zod), SQL-injection-safe queries, XSS-safe rendering, CSRF protection
- Rate limiting (Redis), secure headers, secrets management
- Secure file handling — signed, expiring, permission-checked URLs
- Immutable audit logs (login, role changes, deletions, exports, admin actions) protected from ordinary users
- Structured logging with secret redaction

---

## 12. Performance

Measured budgets from day one: first load, TTI, API p95, query time.

- SSR + streaming, minimal client JS, code splitting, image optimization, lazy loading
- Indexed queries, cursor pagination, connection pooling
- Redis caching where it earns its complexity — tenant-scoped, correctly invalidated, never an auth bypass
- Heavy work (imports, indexing, AI, digests) off the request path in background jobs

---

## 13. Quick Start

### Cloud
Sign up at the hosted site, create your organization, invite your team. *(In development.)*

### Self-Hosted (Docker)

```bash
git clone https://github.com/<org>/nexora-crm.git
cd nexora-crm
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed     # optional demo data
npm run dev
```

Production deployment, backup and upgrade guides live in [`/docs`](./docs).

---

## 14. Repository Structure

```
/apps
  /web                 Next.js application
  /api                 API layer (module endpoints)

/packages
  /ui                  Nexora design system
  /database            Schema, migrations, query layer
  /auth                Authentication & sessions
  /config              Shared configs (eslint, tsconfig, tailwind)
  /types               Shared TypeScript types
  /validation          Zod schemas (shared contracts)
  /ai                  AIProvider abstraction + adapters
  /search              SearchProvider abstraction + adapters
  /realtime            WebSocket gateway & events
  /integrations        Integration framework

/infrastructure        Docker Compose, deploy configs
/docs                  Architecture, ADRs, API docs, env guide
/tests                 e2e + integration suites
```

---

## 15. MVP Scope

The first production-quality release includes:

1. Authentication & organizations (register, login, invite members)
2. Roles, permissions, departments, teams
3. Contacts, companies, leads
4. Pipelines & deals (kanban + table)
5. Activities, timeline, tasks, notes
6. Global search
7. Notifications
8. Dashboard + basic reports
9. CSV import/export
10. Audit logs
11. Responsive UI
12. Basic AI assistant
13. REST API
14. Docker + documentation + tests

Advanced integrations and sophisticated AI build on this foundation afterward.

---

## 16. Roadmap

| Phase | Focus |
|---|---|
| **1 — Foundation** | Repo, tooling, DB schema, authn, orgs, users, memberships, roles, permissions |
| **2 — Core CRM** | Contacts, companies, leads, pipelines, deals, custom fields |
| **3 — Engagement** | Activities, timeline, tasks, notes, files, notifications |
| **4 — Insight** | Dashboard, reports, global search, audit logs |
| **5 — Scale-out** | CSV import/export, webhooks, API hardening, AI assistant |
| **6 — Enterprise** | Advanced permissions, integrations framework, billing abstraction, admin suite |
| **Beyond** | Semantic search, mobile apps, marketplace, more providers |

---

## 17. Open Source

Built to be contributed to for years:

- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- Architecture docs & ADRs in `/docs`
- Docker Compose dev environment with realistic seed data
- Issue templates & PR template
- CI: lint + typecheck + test + build on every PR
- Conventional commits; focused, reviewable changesets

**Business model:** the software stays fully open source. The hosted cloud may monetize through paid plans, managed hosting, support and enterprise services — the basic open-source CRM is never locked behind the cloud.

---

## 18. License

Recommended: **Apache-2.0** (permissive, explicit patent grant). Final choice documented before first release.

---

<div align="center">

**Nexora CRM** — *Your customers. Your team. One open platform.*

</div>
