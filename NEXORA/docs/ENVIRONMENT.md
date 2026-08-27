# Environment Variables

Copy `.env.example` → `.env`. Only `DATABASE_URL` is strictly required.

## API (`apps/api`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development \| test \| production` |
| `API_PORT` | no | `4000` | HTTP port |
| `API_HOST` | no | `0.0.0.0` | Bind address |
| `DATABASE_URL` | **yes** | — | Postgres connection string |
| `REDIS_URL` | phase 2+ | `redis://localhost:6379` | Cache/limits/presence (not yet consumed) |
| `WEB_ORIGIN` | prod | `http://localhost:3000` | Allowed CORS origin |
| `LOG_LEVEL` | no | `info` | Fastify logger level; secrets are redacted |
| `COOKIE_SECURE` | no | auto | `auto`: secure cookies when `NODE_ENV=production` |

## Web (`apps/web`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `API_ORIGIN` | no | `http://127.0.0.1:4000` | Server-side fetches (SSR) to the API |
| `API_PROXY_TARGET` | no | `http://127.0.0.1:4000` | Dev proxy for same-origin `/api/v1/*` |

No `NEXT_PUBLIC_*` variables are needed in Phase 1: the browser only talks to
its own origin, and Next.js rewrites `/api/v1/:path*` to the API in
development — keeping session cookies first-party without CORS.

## Tooling / CI

| Variable | Used by | Description |
|---|---|---|
| `TEST_DATABASE_URL` | Vitest integration suite | When set (and migrations applied), DB-backed tests run; otherwise they skip |
| `SEED_PASSWORD` | `npm run db:seed` | Password for all demo users (default `Password123!`) |

## Production notes

- Terminate TLS at your edge/proxy and set `COOKIE_SECURE=true`.
- Rotate the database credential via your secret manager; never commit `.env`.
- Set `LOG_LEVEL=warn` or lower in noisy environments.
