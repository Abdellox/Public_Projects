import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { organizationMemberships } from "./memberships";
import { users } from "./users";

/**
 * Organizational structure is fully org-defined â€” no hardcoded departments,
 * teams or titles anywhere in the platform.
 */

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    color: text("color").notNull().default("#6366f1"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (t) => [
    uniqueIndex("departments_org_slug_unique").on(t.organizationId, t.slug),
    index("departments_org_idx").on(t.organizationId)
  ]
);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (t) => [
    // Slug uniqueness is scoped to the parent department.
    uniqueIndex("teams_dept_slug_unique").on(t.departmentId, t.slug),
    index("teams_org_idx").on(t.organizationId),
    index("teams_dept_idx").on(t.departmentId)
  ]
);

export const jobTitles = pgTable(
  "job_titles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Lowercased name used for case-insensitive uniqueness. */
    nameNorm: text("name_norm").notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("job_titles_org_norm_unique").on(t.organizationId, t.nameNorm)]
);

export const skillLevels = ["beginner", "intermediate", "advanced", "expert"] as const;
export const skillLevelEnum = pgEnum("skill_level", skillLevels);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    nameNorm: text("name_norm").notNull(),
    usageCount: integer("usage_count").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("skills_org_norm_unique").on(t.organizationId, t.nameNorm)]
);

export const userSkills = pgTable(
  "user_skills",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    /** Denormalized for cheap tenant-scoped expertise queries. */
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    level: skillLevelEnum().notNull().default("intermediate"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.skillId] }),
    index("user_skills_org_skill_idx").on(t.organizationId, t.skillId),
    index("user_skills_user_idx").on(t.userId)
  ]
);

export const departmentsRelations = relations(departments, ({ many }) => ({
  teams: many(teams),
  members: many(organizationMemberships)
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  department: one(departments, {
    fields: [teams.departmentId],
    references: [departments.id]
  }),
  members: many(organizationMemberships)
}));
