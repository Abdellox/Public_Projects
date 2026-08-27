import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { departments, jobTitles, teams } from "./structure";
import { organizations } from "./organizations";
import { roles } from "./roles";
import { users } from "./users";

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "invited",
  "suspended"
]);

/**
 * The join between a user and an organization â€” carries the user's place in
 * the org chart (role, department, team, title). All authorization flows
 * resolve through this table.
 */
export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null"
    }),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
    jobTitleId: uuid("job_title_id").references(() => jobTitles.id, { onDelete: "set null" }),
    status: membershipStatusEnum().notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    uniqueIndex("memberships_org_user_unique").on(t.organizationId, t.userId),
    index("memberships_org_idx").on(t.organizationId),
    index("memberships_user_idx").on(t.userId),
    index("memberships_dept_idx").on(t.departmentId),
    index("memberships_team_idx").on(t.teamId)
  ]
);

export const organizationMembershipsRelations = relations(
  organizationMemberships,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMemberships.organizationId],
      references: [organizations.id]
    }),
    user: one(users, { fields: [organizationMemberships.userId], references: [users.id] }),
    role: one(roles, { fields: [organizationMemberships.roleId], references: [roles.id] }),
    department: one(departments, {
      fields: [organizationMemberships.departmentId],
      references: [departments.id]
    }),
    team: one(teams, { fields: [organizationMemberships.teamId], references: [teams.id] }),
    jobTitle: one(jobTitles, {
      fields: [organizationMemberships.jobTitleId],
      references: [jobTitles.id]
    })
  })
);
