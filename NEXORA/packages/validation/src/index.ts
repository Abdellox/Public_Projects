import { z } from "zod";

/**
 * Shared request/response contracts. Both the API (server-side validation)
 * and the web app (inline form feedback) import these schemas, so the two
 * can never drift apart.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z.string().regex(UUID_REGEX, "Must be a valid identifier");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Maximum 128 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(48)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Lowercase letters, numbers and single dashes only"
  );

/** Org-scoped display names: departments, teams, titles, skills. */
export const nameSchema = z.string().trim().min(2).max(80);

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #6366f1");

/* ---------------------------------- auth ---------------------------------- */

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: passwordSchema
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128)
});
export type LoginInput = z.infer<typeof loginSchema>;

/* ------------------------------ organizations ------------------------------ */

export const createOrganizationSchema = z.object({
  name: nameSchema,
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).optional()
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().trim().max(500).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional()
});

/* --------------------------- structure entities ---------------------------- */

export const createDepartmentSchema = z.object({
  name: nameSchema,
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).nullable().optional(),
  color: hexColorSchema.default("#6366f1")
});
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().trim().max(500).nullable().optional(),
  color: hexColorSchema.optional()
});

export const createTeamSchema = z.object({
  departmentId: uuidSchema,
  name: nameSchema,
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).nullable().optional()
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().trim().max(500).nullable().optional()
});

export const createJobTitleSchema = z.object({ name: nameSchema });

/* --------------------------------- members --------------------------------- */

export const skillLevelSchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);
export type SkillLevelInput = z.infer<typeof skillLevelSchema>;

export const memberSkillSchema = z.object({
  name: z.string().trim().min(1).max(60),
  level: skillLevelSchema.default("intermediate")
});

export const updateSelfMembershipSchema = z
  .object({
    departmentId: uuidSchema.nullable().optional(),
    teamId: uuidSchema.nullable().optional(),
    jobTitleId: uuidSchema.nullable().optional()
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateSelfMembershipInput = z.infer<typeof updateSelfMembershipSchema>;

export const replaceSkillsSchema = z
  .object({
    skills: z.array(memberSkillSchema).max(30)
  })
  .refine(
    (v) => new Set(v.skills.map((s) => s.name.trim().toLowerCase())).size === v.skills.length,
    { message: "Duplicate skills are not allowed" }
  );
export type ReplaceSkillsInput = z.infer<typeof replaceSkillsSchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    bio: z.string().trim().max(1000).nullable().optional(),
    interests: z.array(z.string().trim().min(1).max(40)).max(20).optional()
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateMemberSchema = z
  .object({
    roleId: uuidSchema.optional(),
    departmentId: uuidSchema.nullable().optional(),
    teamId: uuidSchema.nullable().optional(),
    jobTitleId: uuidSchema.nullable().optional(),
    status: z.enum(["active", "suspended"]).optional()
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

/* ------------------------------- invitations ------------------------------- */

export const createInvitationSchema = z.object({
  email: emailSchema,
  roleId: uuidSchema
});
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(16).max(128)
});

/* -------------------------------- pagination ------------------------------- */

export const paginationQuerySchema = z.object({
  cursor: z.string().min(4).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional()
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const listMembersQuerySchema = paginationQuerySchema.extend({
  departmentId: uuidSchema.optional(),
  teamId: uuidSchema.optional()
});

export const auditLogQuerySchema = paginationQuerySchema.extend({
  action: z.string().trim().max(80).optional()
});
