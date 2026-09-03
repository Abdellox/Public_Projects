import type { Permission } from '@businex/types';

/**
 * Centralized authorization.
 *
 * Permissions are strings like `invoice:read`. A role groups permissions, and
 * roles may be scoped to organization units for least privilege. This is the
 * single authorization model every module uses.
 */
export interface Identity {
  userId: string;
  tenantId: string;
  email: string;
  displayName: string;
  roles: string[];
  /** Flat set of effective permissions, or ['*'] for super-admin. */
  permissions: Permission[];
}

export function hasPermission(identity: Identity, permission: Permission): boolean {
  if (identity.permissions.includes('*')) return true;
  return identity.permissions.includes(permission);
}

export function hasAny(identity: Identity, permissions: Permission[]): boolean {
  if (identity.permissions.includes('*')) return true;
  return permissions.some((p) => identity.permissions.includes(p));
}
