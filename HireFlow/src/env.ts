import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(1),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export const env = envSchema.parse(process.env);
