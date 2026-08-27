import { defineConfig } from 'drizzle-kit';
import './src/env';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://nexora:nexora@localhost:5432/nexora',
  },
});
