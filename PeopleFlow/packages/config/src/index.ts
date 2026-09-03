import { z } from "zod";

const boolString = z
  .string()
  .optional()
  .transform((v) => v === "true" || v === "1");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(16, "SESSION_SECRET must be at least 16 characters")
    .default("dev-only-insecure-session-secret"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default("0.0.0.0"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  REDIS_URL: z.string().optional(),

  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().default("./.data/files"),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("peopleflow"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: boolString,

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default("PeopleFlow <no-reply@peopleflow.local>"),

  AI_PROVIDER: z.enum(["none", "openai", "anthropic"]).default("none"),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Parse and validate environment variables. Throws with a readable report on failure. */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  if (cached && source === process.env) return cached;
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  const env = parsed.data;
  if (source !== process.env) return env;
  cached = env;
  return env;
}

export function corsOriginList(env: Env): string[] {
  return env.CORS_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isProduction(env: Env): boolean {
  return env.NODE_ENV === "production";
}
