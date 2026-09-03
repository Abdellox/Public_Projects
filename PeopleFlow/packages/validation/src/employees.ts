import { z } from "zod";
import { isoDate, phone, url } from "./common.js";

// ── Auth & organizations ─────────────────────────────────────────────────────

export const signupSchema = z.object({
  organizationName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128)
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  name: z.string().trim().min(2).max(120),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(10).max(128),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  });

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only")
    .optional(),
  logoUrl: url,
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  logoUrl: url.nullable(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(120),
  roleId: z.string().uuid(),
});

export const updateMemberSchema = z.object({
  roleId: z.string().uuid().optional(),
});

// ── Roles ────────────────────────────────────────────────────────────────────

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  permissions: z.array(z.string().max(64)).max(200),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  permissions: z.array(z.string().max(64)).max(200).optional(),
});

// ── Employees ────────────────────────────────────────────────────────────────

export const employmentTypeValues = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERN",
  "FREELANCER",
] as const;

const employeeCore = {
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  phone,
  dateOfBirth: isoDate.optional(),
  address: z.string().trim().max(400).optional(),
  jobTitleId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  employmentType: z.enum(employmentTypeValues),
  startDate: isoDate,
  statusId: z.string().uuid().optional(),
  skills: z.array(z.string().trim().max(50)).max(50).optional(),
  emergencyContactName: z.string().trim().max(120).optional(),
  emergencyContactPhone: phone,
  customFields: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
};

export const createEmployeeSchema = z.object(employeeCore);

export const updateEmployeeSchema = z.object({
  ...employeeCore,
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  employmentType: z.enum(employmentTypeValues).optional(),
  startDate: isoDate.optional(),
});

export const listEmployeesQuery = z.object({
  q: z.string().trim().max(200).optional(),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  employmentType: z.enum(employmentTypeValues).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["name", "startDate", "-name", "-startDate"]).default("name"),
});

// ── Departments / teams / locations / titles / statuses / fields ────────────

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  parentId: z.string().uuid().nullable().optional(),
  managerEmployeeId: z.string().uuid().nullable().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createTeamSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  leadEmployeeId: z.string().uuid().nullable().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const createLocationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  address: z.string().trim().max(300).optional(),
  timezone: z.string().trim().max(64).optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

export const createJobTitleSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const createStatusSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#64748b"),
});

export const updateStatusSchema = createStatusSchema.partial();

export const upsertCustomFieldSchema = z.object({
  entity: z.enum(["EMPLOYEE"]),
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Letters, numbers and underscores"),
  label: z.string().trim().min(1).max(100),
  type: z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "BOOLEAN"]),
  options: z.array(z.string().trim().max(100)).max(50).optional(),
  required: z.boolean().default(false),
});

// ── Salary records (payroll foundation) ──────────────────────────────────────

export const createSalaryRecordSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.enum(["SALARY", "BONUS", "BENEFIT", "COMMISSION", "OTHER"]),
  currency: z.string().trim().length(3).toUpperCase(),
  amountMinor: z.number().int().nonnegative(),
  effectiveFrom: isoDate,
  note: z.string().trim().max(500).optional(),
});

// ── CSV import/export ────────────────────────────────────────────────────────

export const importPreviewSchema = z.object({
  entity: z.literal("EMPLOYEE"),
  rows: z.array(z.record(z.unknown())).min(1).max(5000),
  mapping: z.record(z.string()),
});

export const importCommitSchema = importPreviewSchema.extend({
  mode: z.enum(["create_only", "upsert"]).default("create_only"),
});
