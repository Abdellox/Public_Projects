# API Reference — Phase 1

Base URL: `http://localhost:4000/api/v1` · Auth: `nexora_session` HttpOnly
cookie (or `Authorization: Bearer <token>`).

All errors use one envelope:

```json
{ "error": { "code": "FORBIDDEN", "message": "…", "details": {} } }
```

## Auth

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{name, email, password}` → sets session cookie. Rate limited (10/min). |
| POST | `/auth/login` | Uniform 401 for unknown email / wrong password. Rate limited (10/min). |
| POST | `/auth/logout` | Revokes the presented session. |
| GET | `/auth/me` | `{user, memberships[]}` |

## Organizations

| Method | Path | Permission |
|---|---|---|
| POST | `/organizations` | authenticated (creator becomes owner) |
| GET | `/organizations/mine` | membership |
| GET | `/organizations/slug/:slug` | any active member |
| PATCH | `/organizations/:organizationId` | `organization:update` |

## Structure

| Method | Path | Permission |
|---|---|---|
| GET | `/organizations/:orgId/departments` | `member:view` |
| POST | `/organizations/:orgId/departments` | `department:create` |
| PATCH/DELETE | `/departments/:departmentId` | `department:update` / `:delete` |
| GET | `/organizations/:orgId/teams?departmentId=` | `member:view` |
| POST | `/organizations/:orgId/teams` | `team:create` |
| PATCH/DELETE | `/teams/:teamId` | `team:update` / `:delete` |
| GET | `/organizations/:orgId/job-titles` | `member:view` |
| POST | `/organizations/:orgId/job-titles` | `jobtitle:manage` |
| DELETE | `/job-titles/:jobTitleId` | `jobtitle:manage` |

Deletes are soft; departments refuse deletion while active teams remain.

## Members & invitations

| Method | Path | Permission |
|---|---|---|
| GET | `/organizations/:orgId/members?q=&departmentId=&teamId=&cursor=&limit=` | `member:view` |
| PATCH | `/organizations/:orgId/members/:membershipId` | `member:update` (+`role:manage` for role changes) |
| DELETE | `/organizations/:orgId/members/:membershipId` | `member:remove` |
| POST | `/organizations/:orgId/invitations` | `member:invite` |
| GET | `/organizations/:orgId/invitations` | `member:invite` |
| DELETE | `/organizations/:orgId/invitations/:invitationId` | `member:invite` |
| POST | `/invitations/accept` | authenticated, invited email must match |

Guards: the last active owner cannot be demoted/suspended/removed; the owner
role cannot be granted via invitation.

## Self-service

| Method | Path | Notes |
|---|---|---|
| PATCH | `/me/profile` | name, bio, interests |
| GET | `/me/memberships/:membershipId` | own placement + skills |
| PATCH | `/me/memberships/:membershipId` | self placement (dept/team/title validated against org) |
| PUT | `/me/memberships/:membershipId/skills` | replaces skill set atomically (≤30) |

## Admin

| Method | Path | Permission |
|---|---|---|
| GET | `/organizations/:orgId/audit-logs?action=&cursor=&limit=` | `audit:read` |

## Pagination

Cursor-based on `(created_at, id)` tuples:

```json
{ "items": [...], "nextCursor": "eyJhdCI6Ii4uLiIsImlkIjoiLi4uIn0" }
```

Pass `nextCursor` as `?cursor=` to fetch the next page.
