import { and, count, eq, isNull } from 'drizzle-orm';
import {
  departments,
  getDb,
  organizationMemberships,
  organizations,
  rolePermissions,
  roles,
  sessions,
  teams,
} from '@nexora/database';
import { generateToken } from '@nexora/auth';
import { DEFAULT_ROLES, slugifySafe } from './org.util';
import { ApiError, isUniqueViolation } from '../../lib/errors';

export async function createOrganization(
  ownerUserId: string,
  input: { name: string; slug?: string },
): Promise<{ id: string; name: string; slug: string }> {
  const db = getDb();
  const slug = slugifySafe(input.slug ?? input.name);

  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  if (existing) throw ApiError.conflict('That workspace URL is already taken');

  try {
    return await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({ name: input.name, slug, createdByUserId: ownerUserId })
        .returning({ id: organizations.id, name: organizations.name, slug: organizations.slug });

      const roleIdByKey = new Map<string, string>();
      for (const template of DEFAULT_ROLES) {
        const [role] = await tx
          .insert(roles)
          .values({
            organizationId: org!.id,
            key: template.key,
            name: template.name,
            description: template.description,
            isSystem: true,
          })
          .returning({ id: roles.id });
        roleIdByKey.set(template.key, role!.id);

        if (template.permissions.length > 0) {
          await tx.insert(rolePermissions).values(
            template.permissions.map((permissionKey) => ({
              roleId: role!.id,
              permissionKey,
            })),
          );
        }
      }

      await tx.insert(organizationMemberships).values({
        organizationId: org!.id,
        userId: ownerUserId,
        roleId: roleIdByKey.get('owner')!,
      });

      return org!;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw ApiError.conflict('That workspace URL is already taken');
    }
    throw err;
  }
}

export interface OrganizationDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: Date;
  counts: { members: number; departments: number; teams: number };
}

export async function getOrganizationDetail(
  organizationId: string,
): Promise<OrganizationDetail> {
  const db = getDb();
  const [org] = await db
    .select()
    .from(organizations)
    .where(and(eq(organizations.id, organizationId), isNull(organizations.deletedAt)))
    .limit(1);
  if (!org) throw ApiError.notFound('Organization not found');

  const [membersCount] = await db
    .select({ value: count() })
    .from(organizationMemberships)
    .where(eq(organizationMemberships.organizationId, organizationId));
  const [departmentsCount] = await db
    .select({ value: count() })
    .from(departments)
    .where(eq(departments.organizationId, organizationId));
  const [teamsCount] = await db
    .select({ value: count() })
    .from(teams)
    .where(eq(teams.organizationId, organizationId));

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logoUrl: org.logoUrl,
    createdAt: org.createdAt,
    counts: {
      members: Number(membersCount?.value ?? 0),
      departments: Number(departmentsCount?.value ?? 0),
      teams: Number(teamsCount?.value ?? 0),
    },
  };
}

export async function updateOrganization(
  organizationId: string,
  patch: { name?: string; logoUrl?: string | null },
): Promise<OrganizationDetail> {
  const db = getDb();
  await db
    .update(organizations)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId));
  return getOrganizationDetail(organizationId);
}

/**
 * Soft-deletes the organization and revokes every member session so
 * no one keeps working inside a deleted tenant.
 */
export async function deleteOrganization(organizationId: string): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx
      .update(organizations)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(organizations.id, organizationId), isNull(organizations.deletedAt)));

    const memberRows = await tx
      .select({ userId: organizationMemberships.userId })
      .from(organizationMemberships)
      .where(eq(organizationMemberships.organizationId, organizationId));

    for (const member of memberRows) {
      await tx
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(
          and(eq(sessions.userId, member.userId), isNull(sessions.revokedAt)),
        );
    }
  });
}

export function newOpaqueToken(): string {
  return generateToken();
}
