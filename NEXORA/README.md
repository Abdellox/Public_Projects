# NEXORA

> **An intelligent digital world for companies** — where employees are organized according to the real structure of their company and can communicate, share knowledge, solve problems, learn from each other, and use AI across the entire organization.

NEXORA is an open-source platform that turns an organization into a living digital entity: departments, teams, people, conversations, knowledge, and AI — connected on **one platform**, with organizational intelligence that surfaces where communication breaks down before those breakdowns become bad decisions.

---

## Table of Contents

1. [Why NEXORA Exists](#1-why-nexora-exists)
2. [Core Product Vision](#2-core-product-vision)
3. [Feature Overview](#3-feature-overview)
4. [Architecture Overview](#4-architecture-overview)
5. [Technology Choices & Justification](#5-technology-choices--justification)
6. [Database Schema](#6-database-schema)
7. [Permission Model](#7-permission-model)
8. [API Architecture](#8-api-architecture)
9. [Realtime Architecture](#9-realtime-architecture)
10. [AI Architecture](#10-ai-architecture)
11. [Search Architecture](#11-search-architecture)
12. [Security Model](#12-security-model)
13. [Performance Strategy](#13-performance-strategy)
14. [Repository Structure](#14-repository-structure)
15. [MVP Scope](#15-mvp-scope)
16. [Roadmap](#16-roadmap)
17. [Open Source & Contributing](#17-open-source--contributing)
18. [License](#18-license)

---

## 1. Why NEXORA Exists

Most companies do not fail because of a lack of talent or effort. They fail because of **organizational friction** — the classic management problems studied in every MBA program:

### The problems NEXORA identifies and fixes

| Organizational failure | What it looks like in reality | How NEXORA fixes it |
|---|---|---|
| **Departmental silos** | Engineering doesn't know what Sales promised; Marketing doesn't know what Product is building. | Every department gets a connected digital space inside one shared world — visible boundaries, shared context, cross-department discovery. |
| **Bad decisions from missing information** | Decisions are made without knowing that another team already solved (or failed at) the same problem. | Organizational intelligence answers *"Have we solved this before?"*, *"Who has dealt with this?"*, *"Are other teams seeing the same issue?"* before a decision is finalized. |
| **Communication distortion** | Messages degrade as they pass between departments; leadership announcements get lost; frontline insight never reaches decision-makers. | Direct global channels + department spaces mean information travels through structured, searchable, permanent paths instead of hallway whispers. |
| **Tribal knowledge loss** | Critical know-how lives in one person's head or a dead chat thread. When they leave, the company re-learns painfully. | Solved discussions are converted into searchable knowledge articles. Organizational memory compounds instead of evaporating. |
| **Duplicated work** | Two departments independently build the same tooling, research the same market, or repeat the same mistake. | Duplicate-question detection, related-discussion recommendations, and org-wide knowledge discovery make existing work discoverable. |
| **Expertise invisibility** | Nobody knows who in the company has PostgreSQL performance or Kafka scaling experience. | Skill/expertise graphs let anyone ask *"Who knows about X?"* and get permission-aware answers. |
| **Slow cross-department escalation** | Problems bounce between departments with no owner, no history, no accountability. | Discussions have resolution states, tags, department context, and audit trails. Problems become traceable. |
| **Misaligned incentives & blind spots** | Management sees only polished reports; recurring pain points stay invisible until they explode. | Aggregated, anonymized insights show *the most common problems per department* — surfacing systemic issues early. |

### The core thesis

> **People + Organization + Communication + Knowledge + AI**

An organization is not a collection of disconnected employees and chat messages. It is a network. When the network is visible, searchable, and intelligent:

- decisions get made with full context,
- knowledge stops leaking out of the company,
- departments stop working against each other,
- and the organization starts learning from itself.

NEXORA is **not** a forum, Slack clone, Discord clone, or Reddit clone. It is a complete digital representation of a company.

---

## 2. Core Product Vision

When an employee registers, they create or join an organization and define their **organizational identity**:

```
Company
├── Departments
│    ├── Teams
│    │    └── Employees
│    └── Channels
├── Global Community
├── Knowledge
└── AI
```

They declare their **department, team, job title, skills, areas of expertise, and interests** — and the platform automatically personalizes everything:

An employee who is *Engineering → Backend → Backend Engineer* with skills in Python, PostgreSQL, and APIs automatically gets access to:

- Global company communication
- The Engineering community and Backend community
- Relevant channels, knowledge, people, and discussions

**Nothing important requires manual discovery.** No hardcoded departments, teams, or job titles — organizations define their own structure.

---

## 3. Feature Overview

### 🌍 Global Company World
Global feed, discussions, announcements, chat, questions, polls, knowledge sharing, reactions, threaded comments, mentions, search. Distinct from department spaces.

### 🏢 Department Worlds
Every department (custom-defined by each organization) has its own space: overview, members, teams, channels, discussions, knowledge, resources, questions, announcements, activity feed, and its own AI assistant context.

### 💬 Communication — two models, never mixed

| Real-time Chat (ephemeral) | Discussions (durable) |
|---|---|
| Global / department / team / channel chat | Posts, questions, problems, ideas, announcements |
| DMs & group messages | Nested replies, reactions, tags |
| Threads, reactions, mentions | Accepted-answer / resolution state |
| Typing indicators, presence, read states | Bookmarks, follow, related discussions |
| Editing, deletion, attachments | Searchable forever |

Ephemeral chat and permanent knowledge live in **separate data models**.

### 📚 Knowledge System
Documentation, solved problems, FAQs, tutorials, best practices, guides, policies, and user articles — plus an approval workflow that converts successful discussions into reusable knowledge ("Convert this discussion into a knowledge article?"). A continuously improving organizational memory.

### 🔎 Universal Search
People, departments, teams, channels, messages, discussions, knowledge, documents, tags — keyword now, semantic later, natural-language eventually. **Search never exposes content the user cannot access directly.**

### 🤖 AI Layer
Global / department / team / knowledge assistants, discussion and chat summarization, Q&A, duplicate detection, knowledge generation, expert recommendations, onboarding help, tagging and topic extraction. Provider-agnostic (`AIProvider` interface: OpenAI, Anthropic, local models, future providers). **AI retrieval is strictly permission-filtered — the model is never the authorization mechanism.**

### 🧠 Organizational Intelligence
Models relationships between employees, jobs, skills, teams, departments, projects, problems, discussions, knowledge, and experts to answer:

- Who knows about this?
- Who has solved this before?
- Which department deals with this?
- Are other teams experiencing the same problem?
- What knowledge already exists?
- What are the most common problems in this department?

This is the differentiator — built progressively, not over-engineered in v1.

### 👤 Profiles & Multi-Tenancy
Rich employee profiles (title, department, team, skills, expertise, contributions, availability) with privacy controls. Strict multi-tenant isolation: **one company's data can never leak into another's.**

### 🛠 Administration
Organization settings, department/team/job-title management, users, invitations, roles, permissions, moderation, content management, security settings, audit logs, AI settings, retention, integrations.

---

## 4. Architecture Overview

A **modular monolith** — deliberately. Microservices would be premature; module boundaries keep future extraction cheap.

```
                    ┌─────────────────────────────────────────┐
                    │              Client (Web)               │
                    │   SSR + islands · minimal client JS     │
                    └────────────────────┬────────────────────┘
                                         │ HTTPS / WSS
                    ┌────────────────────▼────────────────────┐
                    │            API Gateway layer             │
                    │   authn → authz → validation → routing   │
                    └───────┬──────────┬──────────┬───────────┘
                            │          │          │
        ┌───────────────────▼───┐ ┌────▼─────┐ ┌──▼──────────┐
        │   Core modules        │ │ AI layer │ │  Search      │
        │  orgs · depts · teams │ │ provider │ │  keyword →   │
        │  channels · chat      │ │ adapter  │ │  vector      │
        │  discussions · knowl. │ │ + perm-  │ │  filtered    │
        │  profiles · admin     │ │ aware    │ │  pipeline    │
        └───────────┬───────────┘ │ retrieval│ └──┬───────────┘
                    │             └────┬─────┘    │
        ┌───────────▼──────────────────▼──────────▼───────────┐
        │                PostgreSQL (source of truth)          │
        ├───────────────────────────────────────────────────────┤
        │  Redis: cache · rate limits · presence · job queue    │
        │  Object storage: attachments & files                  │
        │  Background workers: indexing · AI jobs · digests     │
        └───────────────────────────────────────────────────────┘
```

Key principles:

- **Database is authoritative.** Realtime events are delivery mechanisms, never the source of truth.
- **Authorization is enforced server-side** on every operation — including search and AI retrieval.
- **Modules communicate through explicit interfaces**, not shared internals.
- Services are extracted only when scale or ownership demands it.

---

## 5. Technology Choices & Justification

| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript** everywhere | Type safety end-to-end, huge ecosystem, open-source friendly, one language across stack |
| Frontend | **Next.js (App Router)** + React Server Components | SSR/streaming for fast first load, minimal client JS, excellent DX |
| Styling / UI | **Tailwind CSS** + custom design system (headless primitives via Radix-style accessibility) | Original visual identity without fighting an opinionated kit; accessible primitives for free |
| Backend | **Node.js** modular monolith (API colocated with web initially, clean module seams) | Simplest deployable unit; extract later only if needed |
| Primary database | **PostgreSQL** | Relational integrity for org structures, JSONB flexibility, full-text search baseline, row-level patterns for tenancy |
| Cache / rate limit / realtime state | **Redis** | Proven, simple, right-sized for ephemeral state |
| Realtime | **WebSocket gateway** (Socket.IO-compatible protocol or raw WS) with Redis pub/sub fan-out | Horizontal scaling, presence, typing, read receipts |
| Search | Start: **PostgreSQL FTS** → dedicated engine (**Meilisearch/OpenSearch**) when needed behind a `SearchProvider` interface | No premature infra; swap-in ready |
| AI | **`AIProvider` abstraction**: OpenAI, Anthropic, local (Ollama/vLLM), future | No vendor lock-in; permission-aware retrieval sits *above* any provider |
| Files | S3-compatible object storage (MinIO locally) | Standard, self-hostable |
| Jobs | Lightweight queue on Redis (BullMQ-style) | Indexing, AI summaries, digests off the request path |
| Validation | Zod (shared schemas in `/packages/validation`) | Single source of truth for input contracts |
| Auth | Credentials + MFA-ready sessions (argon2id hashing), OAuth-ready adapters | Secure-by-default, extensible |
| Testing | Vitest (unit/integration) + Playwright (e2e) | Fast feedback + real-browser confidence |
| CI/CD | GitHub Actions | Lint, typecheck, test, build on every PR |

---

## 6. Database Schema

Core entities (PostgreSQL, migrations-first, cursor-paginated access paths):

```
organizations            tenants — hard isolation boundary
users                    global identity (auth credentials, profile)
memberships              user ↔ organization (role, department, team, title)
departments              org-scoped, user-definable
teams                    belong to departments
job_titles               org-scoped dictionary
skills / user_skills     many-to-many expertise graph
channels                 scoped: global | department | team | custom
channel_memberships      access control for private channels
conversations            DMs & group chats
messages                 chat messages (+ threads via parent_message_id)
message_read_state       per-user read cursors
discussions              posts/questions/problems/ideas/announcements
discussion_replies       nested/threaded comments
reactions                polymorphic (message | discussion | reply)
tags / taggings          polymorphic taxonomy
knowledge_articles       versioned articles
knowledge_sources        provenance (origin discussion, doc import…)
attachments              object-storage references + scan status
notifications            per-user inbox
ai_conversations         assistant threads (scoped + permission snapshot)
audit_logs               immutable security/compliance trail
roles / permissions      RBAC + fine-grained resource permissions
invitations              email-based org joining
```

Rules: proper PK/FKs, unique constraints, indexes matched to real access patterns, timestamps on everything, soft deletion where appropriate, **no unbounded queries, no N+1s**, cursor pagination for all large collections.

---

## 7. Permission Model

Every protected operation resolves the same chain, server-side:

```
User → Organization membership → Role → Permission → Resource → Action
```

Examples the system must enforce:

- Can this user **see** this channel / message / knowledge article / employee profile?
- Can this user **ask AI** about this document?
- Can this user **modify** this department?
- Can this user **manage** the organization?

Design rules:

- **Never trust the frontend.** Authorization lives entirely server-side.
- Permission checks are a single reusable policy module used by CRUD APIs, search, *and* AI retrieval — one implementation, no drift.
- Roles are org-defined (defaults seeded: Owner, Admin, Member, Guest); permissions are fine-grained and data-driven, never hardcoded.
- Cache invalidation always respects tenant scoping — caching never bypasses authorization.

---

## 8. API Architecture

Clean contract, separated by domain:

```
/auth          register, login, MFA, sessions, password reset
/organizations create, settings, members, invitations
/departments   CRUD, membership, overview
/teams         CRUD, membership
/channels      CRUD, membership, history
/discussions   CRUD, replies, reactions, resolve, bookmark
/messages      send, edit, delete, read-state (REST + WS events)
/conversations DMs & groups
/knowledge     articles, versions, sources, conversion workflow
/search        unified, permission-filtered, typed results
/ai            assistants, summarize, generate-knowledge, recommend
/notifications list, mark-read, preferences
/admin         roles, permissions, moderation, audit logs
```

All external input validated (Zod schemas shared with frontend). Predictable error envelope:

```json
{ "error": { "code": "FORBIDDEN", "message": "...", "details": {} } }
```

---

## 9. Realtime Architecture

- Isolated WebSocket gateway — **no business logic in the socket layer**.
- Events: `message.created`, `typing`, `presence.updated`, `read.state`, `notification.new`.
- Fan-out via Redis pub/sub → horizontally scalable.
- Clients persist optimistically; **server confirms from the database**. Reconnect = resync from cursor, never trust client state.
- Presence stored in Redis with TTL heartbeats.

---

## 10. AI Architecture

Strict flow — the model never touches the database:

```
User question
  → authorization check (same policy engine as everything else)
  → retrieve ONLY permitted resources (search + graph)
  → context filtering + prompt-injection scrubbing of retrieved docs
  → provider call via AIProvider interface
  → response validation
  → response
```

Defenses: treat retrieved company content as **untrusted input** (injection-resistant templates, instruction/data separation), provider-agnostic interface, per-org AI settings (enable/disable features, choose provider, retention), audit logging of AI access to sensitive resources.

---

## 11. Search Architecture

- Independent module behind `SearchProvider`.
- v1: PostgreSQL full-text search with tenant + permission filters applied *before* result assembly.
- Later: dedicated engine + embeddings for semantic/natural-language search ("Who has experience with PostgreSQL performance problems?").
- **Every result passes authorization** — search can never leak restricted content.
- Indexing happens in background workers, never on the request path.

---

## 12. Security Model

Foundational, not bolted on:

- Secure authn (argon2id), MFA-ready session architecture, session revocation
- RBAC + fine-grained authorization, enforced server-side only
- Hard tenant isolation (org scoping on every query + tests proving it)
- Permission-aware search **and** permission-aware AI retrieval
- TLS everywhere, secure headers, CSRF protection, XSS-safe rendering
- Rate limiting (Redis), input/output validation, abuse prevention
- File upload validation & scanning
- Immutable audit logs + security event logging
- Admin-only operations verified by tests, not convention
- Secrets never logged; structured logging with redaction

Security regression tests are mandatory: Org A cannot read Org B; non-members cannot read private channels; search and AI respect every restriction.

---

## 13. Performance Strategy

Budgets measured from day one: first load, TTI, API p95, DB query time, search latency, realtime delivery, AI first-token.

- SSR + streaming; minimal client JS; code splitting
- Image optimization, lazy loading, CDN-friendly
- Indexed queries, cursor pagination, connection pooling
- Redis caching where it earns its complexity — correctly invalidated, tenant-scoped, never an auth bypass
- Expensive work (indexing, AI, digests) in background jobs
- Realtime fan-out via pub/sub, efficient payloads

Start as a monolith; measure; extract services only with real cause.

---

## 14. Repository Structure

```
/apps
  /web                 Next.js application (SSR + client islands)
  /api                 API layer (module endpoints)

/packages
  /ui                  Design system components
  /database            Schema, migrations, query layer
  /auth                Authentication & session core
  /config              Shared configs (eslint, tsconfig, tailwind)
  /types               Shared TypeScript types
  /validation          Zod schemas (shared contracts)
  /ai                  AIProvider abstraction + adapters
  /search              SearchProvider abstraction + adapters
  /realtime            WebSocket gateway & event contracts

/infrastructure        Docker Compose, deployment configs
/docs                  Architecture, ADRs, API docs, env guide
/tests                 e2e + integration suites
```

---

## 15. MVP Scope

The first usable version delivers:

1. Create organization, register/login, invite employees
2. Choose department / team / job title during onboarding
3. Create departments, teams, channels (fully org-defined)
4. Global company space + department spaces + team spaces
5. Discussions with comments, reactions, resolution
6. Real-time messaging + direct messages
7. Employee profiles & expertise discovery
8. Basic (permission-filtered) search
9. Knowledge articles + discussion→knowledge workflow
10. Permissions/RBAC, notifications, basic AI assistant
11. Admin dashboard + audit logs
12. Responsive premium UI

Advanced AI and full organizational intelligence expand after this foundation is stable.

---

## 16. Roadmap

| Phase | Focus |
|---|---|
| **1 — Foundation** | Repo, tooling, DB, config, authn, orgs, users, memberships, roles, permissions, departments, teams, titles, skills |
| **2 — Core social** | Global/department/team spaces, channels, discussions, comments, reactions, mentions, bookmarks, notifications |
| **3 — Realtime** | Chat, DMs, group conversations, threads, presence, typing, read states |
| **4 — Knowledge** | Articles, categories, tags, search, saved knowledge, discussion→knowledge workflow |
| **5 — AI** | Abstraction layer, provider adapters, permission-aware retrieval, assistants, summaries, recommendations |
| **6 — Enterprise** | Admin suite, moderation, audit, advanced permissions, analytics, integrations, org intelligence dashboards |
| **Beyond** | Mobile apps, bots/plugins, HR/calendar/PM integrations, semantic Q&A, cross-team problem analytics |

---

## 17. Open Source & Contributing

Built to be contributed to for years:

- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- Architecture docs & ADRs in `/docs`
- Docker Compose dev environment + seed/demo data (a realistic multi-department demo company)
- Issue templates & PR template
- CI: lint + typecheck + tests + build on every PR
- Conventional commits; focused, reviewable changesets

```bash
git clone https://github.com/<org>/nexora.git
cd nexora
cp .env.example .env
docker compose up -d
npm install && npm run db:migrate && npm run db:seed
npm run dev
```

## 18. License

Recommended: **Apache-2.0** (permissive with explicit patent grant — ideal for infrastructure projects). MIT acceptable if preferred; final choice documented before first release.
