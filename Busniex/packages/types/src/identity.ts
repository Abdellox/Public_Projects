import type { Id, IsoDateTime } from './primitives';

/**
 * Identity, authentication and authorization types.
 *
 * Every module uses the same centralized authorization infrastructure:
 * RBAC roles + fine-grained permissions, optionally scoped to organization
 * units (legal entity, department, location, warehouse, project).
 */

export interface User {
  id: Id;
  partyId?: Id;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/** A permission is a capability string like `invoice:read`. */
export type Permission = string;

export interface Role {
  id: Id;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UserRole {
  id: Id;
  userId: Id;
  roleId: Id;
  /** If set, the role is scoped to this org unit (least privilege). */
  orgUnitId?: Id;
}

/** User's active organization context (which tenant/org they are operating as). */
export interface Session {
  userId: Id;
  tenantId: Id;
  organizationId?: Id;
  roles: Role[];
}
