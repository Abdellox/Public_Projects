# BUSINEX Architecture

This document explains the core architectural decisions behind BUSINEX.

## 1. One platform, many capabilities

BUSINEX is not CRM + ERP + HR + POS + Inventory as separate products. It is **one
platform** where these are modules and capabilities built on the same
foundation. Every module reuses:

- the same core entities (`Party`, `Product`, `OrganizationUnit`, `User`, `Invoice`, `Order`)
- the same identity & authorization (`@businex/auth`)
- the same workflow engine (`@businex/module-workflow`)
- the same audit, notifications, documents, APIs, and event system

## 2. Universal Organization Model

A single `Tenant` contains an arbitrarily deep hierarchy of
`OrganizationUnit` nodes (Group, Legal Entity, Business Unit, Division,
Department, Branch, Location, Warehouse, Team, Project). We never assume one
user equals one company, one company equals one legal entity, or one
organization equals one country or currency.

Multi-currency and multi-country are supported from the start via explicit
fields on entities and future localization/compliance modules — nothing is
hard-coded for a single country.

## 3. One shared data model

Canonical entities live in `packages/database/src/schema/` and are described by
`@businex/types`.

- **Party + PartyRole:** a single `party` table; customers, suppliers, partners,
  employees are roles on it.
- **Product + config tables:** one `product` table; sellable/stockable/service
  flags and accounting hooks are additive configuration, not new product tables.
- **Invoice / Order:** shared across small and enterprise workflows; only the
  configured workflow differs.

## 4. Modular monolith

Modules each own a Postgres schema and expose a Hono router through a
`register(db, parentHono)` function plus a `ModuleDescriptor`. They communicate
through shared packages and an in-process `EventBus` (@businex/lib) rather than
direct coupling wherever possible. This keeps the platform simple to operate
now while making it straightforward to extract a module as a service later.

## 5. Reusable workflow engine

`workflow_definition` lists allowed transitions per document type, optionally
scoped to an org unit. `workflow_instance` tracks one document's lifecycle.
Approvals pause a workflow until each approver decides. A small business configures
`Invoice → Paid`; an enterprise configures a long chain — both use the same
Invoice entity and engine.

## 6. Centralized identity & authorization

`@businex/auth` provides JWT issuance/verification, RBAC roles, and
fine-grained permissions (e.g. `invoice:read`). Roles can be scoped to org units
for least privilege. Every module guards routes through `requirePermission`.

## 7. Audit & governance

Every important operation writes an immutable `AuditLog` entry: who, what,
previous/new value, timestamp, tenant, org/legal-entity scope, source, and IP.
The `@businex/module-audit` package exposes a reusable `writeAudit` helper.

## 8. Scalability

Start simple. The modular monolith runs anywhere. The event bus and clean
module boundaries provide a clear upgrade path toward queues, read models, and
horizontal scaling only when justified.

## 9. Extensibility & openness

Modules are the unit of extension. A third party can add a module that reuses
the universal entities without forking the core. The module registry
(`/modules`) exposes what is installed and enabled.
