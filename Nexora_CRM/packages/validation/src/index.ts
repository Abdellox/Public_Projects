import { z } from 'zod';
import { PERMISSIONS } from '@nexora/types';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Must be a valid email address')
  .max(255);

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a digit');

export const nameSchema = z.string().trim().min(2).max(120);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(63)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers and single hyphens',
  );

export const uuidSchema = z.string().uuid();

export const permissionKeySchema = z.enum(
  PERMISSIONS.map((p) => p.key) as unknown as [string, ...string[]],
);

const optionalUuid = uuidSchema.nullable().optional();

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/^-+|-+$/g, '');
}

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema.optional(),
});

export const updateOrganizationSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    logoUrl: z.string().url().max(2048).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'Provide at least one field to update',
  });

export const createInvitationSchema = z.object({
  email: emailSchema,
  roleId: uuidSchema,
  departmentId: optionalUuid,
  teamId: optionalUuid,
});

export const acceptInvitationSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{40,120}$/),
});

export const updateMemberSchema = z
  .object({
    roleId: uuidSchema.optional(),
    status: z.enum(['active', 'suspended']).optional(),
  })
  .refine((v) => v.roleId !== undefined || v.status !== undefined, {
    message: 'Provide roleId or status',
  });

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createTeamSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  departmentId: uuidSchema,
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  departmentId: uuidSchema.optional(),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(200).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(200).nullable().optional(),
});

export const setRolePermissionsSchema = z.object({
  permissions: z.array(permissionKeySchema).min(1),
});
