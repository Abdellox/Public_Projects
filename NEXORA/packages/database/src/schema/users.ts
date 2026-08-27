import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Always stored lowercase; uniqueness enforced here. */
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    interests: text("interests")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /**
     * Profile visibility controls. v1 stores the shape; enforcement expands
     * in later phases (directory views must respect these flags).
     */
    privacy: jsonb("privacy")
      .$type<{ showEmail: boolean; showSkills: boolean }>()
      .notNull()
      .default({ showEmail: true, showSkills: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)]
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(userSessions)
}));

export const userSessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 of the opaque session token — raw tokens are never stored. */
    tokenHash: text("token_hash").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
    index("sessions_user_idx").on(t.userId)
  ]
);
