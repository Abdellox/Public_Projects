import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  DATABASE_URL: z.string().min(1),
  /** Comma-separated list of allowed browser origins. */
  WEB_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  COOKIE_SECURE: z.enum(["auto", "true", "false"]).default("auto")
});

export type ApiEnv = z.infer<typeof envSchema> & {};

export class EnvValidationError extends Error {}

/** Parses and validates environment variables; fails fast at boot. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new EnvValidationError(`Invalid environment configuration — ${details}`);
  }
  return parsed.data;
}

export function allowedOrigins(env: ApiEnv): string[] | boolean {
  if (env.WEB_ORIGIN.trim() === "*") return true;
  return env.WEB_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
