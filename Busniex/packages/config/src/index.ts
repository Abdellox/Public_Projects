import 'dotenv/config';

/**
 * Central environment configuration. Every process (API, web, database)
 * reads validated configuration from here so behaviour is consistent.
 */

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://businex:businex@localhost:5432/businex',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  apiPort: readInt('API_PORT', 4000),
  webOrigins: (process.env.WEB_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  cookieSecure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : process.env.NODE_ENV === 'production',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-me',
  demoPassword: process.env.DEMO_PASSWORD ?? 'Demo1234!',
  nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
};
