import { sql, type AnyColumn, type SQL } from "drizzle-orm";

/**
 * Cursor pagination over (created_at, id) tuples — stable under concurrent
 * inserts, unlike offset pagination. Cursors are opaque base64url blobs;
 * invalid cursors degrade to an empty page rather than unbounded queries.
 */
export interface Cursor {
  at: string; // ISO timestamp
  id: string;
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeCursor(raw: string): Cursor | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "at" in parsed &&
      "id" in parsed &&
      typeof (parsed as Cursor).at === "string" &&
      typeof (parsed as Cursor).id === "string"
    ) {
      const c = parsed as Cursor;
      if (Number.isNaN(new Date(c.at).getTime())) return null;
      return c;
    }
    return null;
  } catch {
    return null;
  }
}

/** Tuple comparison: strictly before the cursor position (DESC ordering). */
export function cursorBefore(createdAtCol: AnyColumn, idCol: AnyColumn, cursor: Cursor): SQL {
  const at = new Date(cursor.at);
  if (Number.isNaN(at.getTime())) return sql`false`;
  return sql`(${createdAtCol}, ${idCol}) < (${at.toISOString()}::timestamptz, ${cursor.id}::uuid)`;
}
