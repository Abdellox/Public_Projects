# REST API — Milestone 1

Base URL: `http://localhost:4000/v1`

All requests and responses are JSON. Browser clients authenticate with the
`nx_session` HttpOnly cookie (set by register/login). Machine clients will use
API tokens in a later milestone.

Errors always use the envelope:

```json
{ "error": { "code": "FORBIDDEN", "message": "...", "details": null } }
```

Common codes: `VALIDATION_ERROR` (422), `UNAUTHENTICATED` (401),
`INVALID_CREDENTIALS` (401), `FORBIDDEN` (403), `NOT_FOUND` (404),
`CONFLICT` (409), `RATE_LIMITED` (429).

> **Tenant note:** accessing another organization's resources returns
> `404 NOT_FOUND`, indistinguishable from a missing organization.

## Auth

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create account, starts session |
| POST | `/auth/login` | public | Start session |
| POST | `/auth/logout` | session | Revoke current session |
| GET | `/auth/me` | session | Current user + memberships |
| POST | `/invitations/accept` | session | Accept invitation `{token}` |

## Organizations

| Method | Path | Permission |
|---|---|---|
| POST | `/organizations` | session (creates owner membership) |
| GET | `/organizations` | session (own list) |
| GET | `/organizations/:orgId` | `organization.read` |
| PATCH | `/organizations/:orgId` | `organization.update` |
| DELETE | `/organizations/:orgId` | `organization.delete` + owner role |

## Members

| Method | Path | Permission |
|---|---|---|
| GET | `/organizations/:orgId/members` | `members.read` |
| PATCH | `/organizations/:orgId/members/:membershipId` | `members.update_role` |
| DELETE | `/organizations/:orgId/members/:membershipId` | `members.remove` |

Guards: an organization must always keep at least one active owner; only an
owner can grant the Owner role.

## Invitations

| Method | Path | Permission |
|---|---|---|
| POST | `/organizations/:orgId/invitations` | `members.invite` |
| GET | `/organizations/:orgId/invitations` | `members.invite` |
| DELETE | `/organizations/:orgId/invitations/:id` | `members.invite` |

Creating an invitation returns `{invitation, token}` — the token powers the
accept link (`/invite/{token}` on the web app). Email delivery is not wired
up yet by design.

## Departments & Teams

CRUD at `/organizations/:orgId/departments` and `/organizations/:orgId/teams`
with permissions `departments.*`, `teams.*`. Names are unique per scope.

## Roles

| Method | Path | Permission |
|---|---|---|
| GET | `/organizations/:orgId/roles` | `roles.read` |
| POST | `/organizations/:orgId/roles` | `roles.create` |
| PATCH | `/organizations/:orgId/roles/:roleId` | `roles.update` (custom only) |
| PUT | `/organizations/:orgId/roles/:roleId/permissions` | `roles.update` (custom only) |
| DELETE | `/organizations/:orgId/roles/:roleId` | `roles.delete` (custom, unused) |

System roles (`owner`, `admin`, `member`) are immutable and cannot be deleted.
Custom roles get arbitrary subsets of the permission catalog.

## Health

`GET /health` → `{status:'ok'}` · `GET /health/db` → database ping.

## Rate limits

Global: 300 req/min/IP. Auth endpoints: 10 req/min/IP. `429` includes
`Retry-After`.
