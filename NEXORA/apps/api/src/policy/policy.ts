import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "@nexora/database";
import {
  organizationMemberships,
  organizations,
  rolePermissions as rolePermissionRows,
  roles,
  users
} from "@nexora/database";
import { forbidden, notFound, type Permission } from "@nexora/types";

/**
 * Server-side authorization. Every protected operation resolves:
 *   user → organization membership → role → permissions → resource → action
 *
 * The same engine guards CRUD routes, search and (later) AI retrieval —
 * there is exactly one implementation so rules can never drift.
 */

export interface MembershipWithRole {
  membershipId: string;
  userId: string;
  organizationId: string;
  roleKey: string;
  roleName: string;
  status: "active" | "invited" | "suspended";
  departmentId: string | null;
  teamId: string | null;
  jobTitleId: string | null;
}

export async function getMembership(
  db: Db,
  organizationId: string,
  userId: string
): Promise<MembershipWithRole | null> {
  const rows = await db
    .select({
      membershipId: organizationMemberships.id,
      userId: organizationMemberships.userId,
      organizationId: organizationMemberships.organizationId,
      roleKey: roles.key,
      roleName: roles.name,
      status: organizationMemberships.status,
      departmentId: organizationMemberships.departmentId,
      teamId: organizationMemberships.teamId,
      jobTitleId: organizationMemberships.jobTitleId
    })
    .from(organizationMemberships)
    .innerJoin(roles, eq(roles.id, organizationMemberships.roleId))
    .innerJoin(users, eq(users.id, organizationMemberships.userId))
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(
      and(
        eq(organizationMemberships.organizationId, organizationId),
        eq(organizationMemberships.userId, userId),
        isNull(organizations.deletedAt),
        isNull(users.deletedAt)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

interface CacheEntry {
  permissions: Set<string>;
  expiresAt: number;
}

/** In-process TTL cache for effective permission sets. Tenant-scoped keys; invalidation is explicit on membership/role changes. */
export class PermissionCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(
    private readonly ttlMs = 60_000,
    private readonly now: () => number = Date.now
  ) {}

  get(organizationId: string, userId: string): Set<string> | null {
    const entry = this.entries.get(key(organizationId, userId));
    if (!entry) return null;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key(organizationId, userId));
      return null;
    }
    return entry.permissions;
  }

  set(organizationId: string, userId: string, permissions: Set<string>): void {
    this.entries.set(key(organizationId, userId), {
      permissions,
      expiresAt: this.now() + this.ttlMs
    });
  }

  invalidate(organizationId: string, userId?: string): void {
    if (userId) {
      this.entries.delete(key(organizationId, userId));
      return;
    }
    const prefix = `${organizationId}:`;
    for (const k of this.entries.keys()) {
      if (k.startsWith(prefix)) this.entries.delete(k);
    }
  }
}

function key(orgId: string, userId: string): string {
  return `${orgId}:${userId}`;
}

export async function effectivePermissions(
  db: Db,
  cache: PermissionCache,
  organizationId: string,
  userId: string
): Promise<Set<string>> {
  const cached = cache.get(organizationId, userId);
  if (cached) return cached;

  const rows = await db
    .select({ permissionKey: rolePermissionRows.permissionKey })
    .from(organizationMemberships)
    .innerJoin(rolePermissionRows, eq(rolePermissionRows.roleId, organizationMemberships.roleId))
    .where(
      and(
        eq(organizationMemberships.organizationId, organizationId),
        eq(organizationMemberships.userId, userId)
      )
    );

  const perms = new Set<string>(rows.map((r) => r.permissionKey));
  cache.set(organizationId, userId, perms);
  return perms;
}

export interface AuthorizeResult {
  membership: MembershipWithRole;
  permissions: Set<string>;
}

/**
 * Resolves membership + effective permissions in one step.
 *
 * Non-members receive a 404 (not a 403) so the existence of organizations
 * cannot be probed by unauthorized callers — a small but important
 * tenant-isolation property.
 */
export async function authorize(
  db: Db,
  cache: PermissionCache,
  organizationId: string,
  userId: string,
  permission?: Permission
): Promise<AuthorizeResult> {
  const membership = await getMembership(db, organizationId, userId);
  if (!membership || membership.status !== "active") {
    throw notFound("Organization not found");
  }
  const permissions = await effectivePermissions(db, cache, organizationId, userId);
  if (permission && !permissions.has(permission)) {
    throw forbidden(`Missing permission: ${permission}`);
  }
  return { membership, permissions };
}
