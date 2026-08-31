import { eq } from "drizzle-orm";
import { getDb, schema } from "../index";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48) || "org";
}

export async function slugifyUnique(db: ReturnType<typeof getDb>, name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await db.select({ id: schema.organizations.id }).from(schema.organizations).where(eq(schema.organizations.slug, candidate)).limit(1);
    if (existing.length === 0) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
