# Deployment

SupplyFlow ships as a single web container plus PostgreSQL. Redis is optional (future background jobs).

## Quick deploy with Docker Compose

```bash
git clone https://github.com/your-org/supplyflow.git
cd supplyflow

# secrets
echo "AUTH_SECRET=$(openssl rand -hex 32)"        >> .env
echo "POSTGRES_PASSWORD=$(openssl rand -hex 16)"  >> .env

docker compose up -d db redis
docker compose build web
docker compose run --rm migrate          # apply schema
docker compose up -d web
```

App: `http://localhost:3000`. Put your reverse proxy (Caddy/Nginx/Traefik) in front for TLS.

## Production compose

For a dedicated host:

```bash
docker build -t supplyflow/web:latest .
export AUTH_SECRET=$(openssl rand -hex 32)
export POSTGRES_PASSWORD=$(openssl rand -hex 16)
docker compose -f docker-compose.prod.yml up -d
# migrations run as a one-shot service before the app starts:
docker compose -f docker-compose.prod.yml logs migrate
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | yes | Session token pepper. **Rotating it invalidates all sessions** |
| `REDIS_URL` | no | Reserved for background jobs |
| `S3_*` | no | Future document storage |
| `AI_*` | no | Future AI-assisted features |

Generate secrets: `openssl rand -hex 32`.

## Upgrades

1. Back up: `pg_dump $DATABASE_URL > backup.sql`
2. Pull the new image / code, rebuild.
3. Run migrations (`npm run db:migrate` or the compose `migrate` service) — they are additive and backward-compatible within a minor version.
4. Start the new app container.

Downgrade = restore backup; do not run older code against newer schema.

## Health & operations

- Liveness: `GET /` returns the login/app shell (200).
- DB connectivity issues surface as 500s on any API route; check container logs first.
- All privileged actions are in `audit_logs`; query by `action` or `entity_type`.

## Backup policy (minimum)

- Nightly `pg_dump`, retained ≥ 14 days, stored off-host.
- Test a restore quarterly.

## Scaling notes

The app is stateless — scale horizontally behind a load balancer; sessions live in Postgres so any replica can serve any user. PostgreSQL sizing guidance:

- < 50 users: 2 vCPU / 4 GB RAM is comfortable
- The hot paths are indexed by `(organization_id, …)`; add PgBouncer only beyond ~200 concurrent connections.
