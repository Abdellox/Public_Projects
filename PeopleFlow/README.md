<div align="center">

# PeopleFlow

**Everything your people need, in one place.**

A modern, fast, secure, open-source HR platform for companies of every size.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/peopleflow/peopleflow/actions/workflows/ci.yml/badge.svg)](https://github.com/peopleflow/peopleflow/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

PeopleFlow helps companies manage **employees, documents, leave, attendance, recruitment,
performance, training and internal organization** from one easy-to-use platform.

> Enterprise HR capabilities with the simplicity of a modern web application.

Replace scattered Excel files, email chains, paper folders and manual leave spreadsheets
with a single system that is simple enough for a small company, powerful enough for a
medium company, and architecturally capable of growing toward enterprise use.

---

## ✨ Features

| Area | What you get |
| --- | --- |
| 👥 **Employee management** | Rich profiles, org chart, custom fields, custom employment statuses, employee directory with search & privacy |
| 🏢 **Multi-tenancy** | Unlimited organizations, hard server-side tenant isolation — Company A can never see Company B's data |
| 🔐 **Roles & permissions** | Fine-grained RBAC (`employee.view`, `salary.view`, `leave.approve`, …), custom roles, server-side authorization everywhere |
| 🌴 **Leave & vacation** | Configurable leave types, allowances, carry-over, approval workflows, balances, team calendars, holiday calendars |
| ⏱️ **Attendance & time** | Clock in/out, breaks, timesheets, overtime, configurable work schedules |
| 📄 **Documents** | Secure storage with permissions, versioning, expiration tracking, audit-logged downloads. Never public URLs. |
| 🎯 **Performance** | Goals, review cycles, self/manager reviews, peer feedback |
| 🧭 **Recruitment** | Lightweight ATS: job openings, candidates, customizable pipelines, interviews, feedback, offers |
| 📚 **Training** | Courses, assignments, completion tracking, expiring certifications |
| 📣 **Announcements** | Company news with reactions & comments, targeted audiences |
| ✅ **Tasks & workflows** | Onboarding/offboarding checklists, reusable workflow templates triggered by events |
| 🔔 **Notifications** | In-app notifications, per-user preferences, background jobs for reminders & expirations |
| 📊 **Dashboards & reports** | Role-based dashboards (Employee / Manager / HR / Executive), headcount, turnover, absence reports |
| 🔎 **Global search** | Permission-aware search across people, teams, documents, jobs, candidates, courses |
| 🤖 **AI assistant** (optional) | Ask about your leave balance, policies, expiring documents… The AI only ever sees data **you** are authorized to see. Provider-agnostic (OpenAI / Anthropic / local models). |
| 📥 **CSV import/export** | Preview → map → validate → dedupe → import; audited exports |
| 🧾 **Audit log** | Every sensitive action recorded: logins, salary views, approvals, exports, admin changes |
| 💰 **Payroll-ready** | Salary/bonus/benefit records with restricted permissions — country-specific payroll modules plug in later |

## 🚀 Quick start (development)

**Prerequisites:** Node.js 20+, pnpm 10+, Docker (or an existing PostgreSQL 16).

```bash
git clone https://github.com/peopleflow/peopleflow.git
cd peopleflow

pnpm install
cp .env.example .env            # defaults work out of the box

docker compose up -d postgres   # or point DATABASE_URL at your own Postgres

pnpm db:migrate                 # create schema
pnpm db:seed                    # demo organization + users

pnpm dev                        # API on :4000 · Web on :3000
```

Open **http://localhost:3000** and sign in:

| Role | Email | Password |
| --- | --- | --- |
| Owner / Admin (HR) | `admin@acme.demo` | `AcmeDemo2024!` |
| Manager | `manager@acme.demo` | `AcmeDemo2024!` |
| Employee | `employee@acme.demo` | `AcmeDemo2024!` |

> Seed passwords are for local development only. Always change them.

### Without Docker

Use any PostgreSQL 16+ instance and set `DATABASE_URL` in `.env`. Redis and S3 are
**optional** — PeopleFlow falls back to in-memory cache and local disk file storage.

## 🐳 Production deploy (self-hosted)

```bash
cp .env.example .env      # set secrets: SESSION_SECRET, POSTGRES_PASSWORD, etc.
docker compose up -d --build
```

That's it — migrations run automatically on container start. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for reverse proxies, HTTPS, S3/MinIO, SMTP and backups.

## 🏗️ Architecture

Modular monolith — one deployable API, clean module boundaries, no microservices complexity.

```
peopleflow/
├── apps/
│   ├── web/                 # Next.js (App Router) + Tailwind CSS front-end
│   └── api/                 # Fastify REST API (modular monolith)
├── packages/
│   ├── database/            # Prisma schema, client, tenant-scoped client, seed
│   ├── auth/                # Password hashing, sessions, RBAC permission engine
│   ├── validation/          # Zod schemas shared by API & web
│   ├── types/               # Shared TypeScript types
│   ├── config/              # Environment parsing & shared tsconfig
│   ├── workflows/           # Workflow engine (templates → runs → tasks)
│   ├── ai/                  # AI provider abstraction + guardrails
│   └── search/              # Permission-aware global search
├── infrastructure/          # Dockerfiles
├── docs/                    # Architecture, deployment, API docs
└── .github/                 # CI, issue & PR templates
```

**Stack:** TypeScript end-to-end · Next.js 14 · Fastify 4 · Prisma 5 · PostgreSQL 16 ·
Tailwind CSS · Redis (optional cache) · S3-compatible storage (optional) · Vitest · Docker.

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design: multi-tenancy model,
permission system, AI security model and extension points.

## 🔑 Security model

HR data is some of the most sensitive data a company owns. Non-negotiables:

* Argon2id-class password hashing (bcrypt cost 12), sessions hashed at rest, httpOnly cookies
* **Tenant isolation enforced twice**: every query scoped by `organizationId` *and* a Prisma
  client extension that injects the tenant filter as a safety net
* All authorization happens **server-side** — the UI hiding a button is cosmetic only
* Restricted permission for compensation data (`salary.view`) — even HR admins must be granted it explicitly
* Audit log for logins, salary access, document downloads, exports, role changes…
* Rate limiting, secure headers, CSRF-safe cookie policy, input validation on every endpoint
* AI assistant: retrieval is filtered by caller permissions *before* the prompt is built;
  retrieved content is sanitized against prompt injection; sensitive actions always require human approval

Report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

## 🗺️ Roadmap

MVP (this repository): authentication, organizations, employees, departments, teams, roles,
directory, profiles, leave, attendance, tasks, documents, on/offboarding, announcements,
performance, recruitment, dashboard, notifications, search, audit logs, CSV import/export,
responsive UI, API, optional AI assistant, Docker, tests, documentation.

Next: XLSX import/export, MFA (TOTP), calendar sync (iCal), Slack/Teams notifications,
payroll modules per country, granular field-level privacy settings, plugin system.

See the [issue tracker](https://github.com/peopleflow/peopleflow/issues) and vote with 👍.

## 🤝 Contributing

We welcome contributions! Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.
Good first issues are labelled `good first issue`.

Please note we have a [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

Apache License 2.0 — free for commercial use. See [LICENSE](LICENSE).
