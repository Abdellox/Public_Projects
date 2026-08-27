/**
 * Shared contracts and the canonical permission catalog.
 * Zero runtime dependencies — safe to import from any package.
 */

export const PERMISSIONS = [
  { key: 'organization.read', description: 'View organization details' },
  { key: 'organization.update', description: 'Update organization settings' },
  { key: 'organization.delete', description: 'Delete the organization' },

  { key: 'members.read', description: 'View organization members' },
  { key: 'members.invite', description: 'Invite new members' },
  { key: 'members.update_role', description: 'Change member roles' },
  { key: 'members.remove', description: 'Remove or suspend members' },

  { key: 'roles.read', description: 'View roles' },
  { key: 'roles.create', description: 'Create custom roles' },
  { key: 'roles.update', description: 'Update roles' },
  { key: 'roles.delete', description: 'Delete custom roles' },

  { key: 'departments.read', description: 'View departments' },
  { key: 'departments.create', description: 'Create departments' },
  { key: 'departments.update', description: 'Update departments' },
  { key: 'departments.delete', description: 'Delete departments' },

  { key: 'teams.read', description: 'View teams' },
  { key: 'teams.create', description: 'Create teams' },
  { key: 'teams.update', description: 'Update teams' },
  { key: 'teams.delete', description: 'Delete teams' },

  { key: 'audit.read', description: 'View audit logs' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export function isPermissionKey(value: string): value is PermissionKey {
  return PERMISSIONS.some((p) => p.key === value);
}

export interface RoleTemplate {
  key: string;
  name: string;
  description: string;
  permissions: readonly PermissionKey[];
}

const ALL: PermissionKey[] = PERMISSIONS.map((p) => p.key);
const ALL_EXCEPT_ORG_DELETE: PermissionKey[] = ALL.filter(
  (k) => k !== 'organization.delete',
);

export const OWNER_ROLE_KEY = 'owner';
export const ADMIN_ROLE_KEY = 'admin';
export const MEMBER_ROLE_KEY = 'member';

/**
 * System roles seeded for every organization. Keys are stable identifiers
 * stored on memberships; names are display defaults an org may rename later.
 */
export const DEFAULT_ROLES: readonly RoleTemplate[] = [
  {
    key: OWNER_ROLE_KEY,
    name: 'Owner',
    description: 'Full control of the organization',
    permissions: ALL,
  },
  {
    key: ADMIN_ROLE_KEY,
    name: 'Administrator',
    description: 'Manages the organization day to day',
    permissions: ALL_EXCEPT_ORG_DELETE,
  },
  {
    key: MEMBER_ROLE_KEY,
    name: 'Member',
    description: 'Standard employee access',
    permissions: [
      'organization.read',
      'members.read',
      'roles.read',
      'departments.read',
      'teams.read',
    ],
  },
];

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = T | ApiErrorBody;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  jobTitle: string | null;
}

export interface MembershipSummary {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  roleKey: string;
  roleName: string;
  status: 'active' | 'suspended';
}

export interface MeResponse {
  user: SessionUser;
  memberships: MembershipSummary[];
}
