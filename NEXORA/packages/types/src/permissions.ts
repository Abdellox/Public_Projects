/**
 * Platform-wide permission catalog.
 *
 * Permissions are data-driven: this catalog is seeded into the `permissions`
 * table by a migration, roles are granted permissions via `role_permissions`,
 * and the policy engine resolves effective permission sets at request time.
 * Nothing here is ever hardcoded against a specific organization.
 */
export const PERMISSIONS = {
  "organization:update": "Update organization settings",
  "organization:delete": "Delete the organization",
  "member:view": "View the member directory",
  "member:invite": "Invite new members",
  "member:update": "Update member placement, status and role assignment",
  "member:remove": "Remove members from the organization",
  "role:manage": "Create and modify roles",
  "department:create": "Create departments",
  "department:update": "Update departments",
  "department:delete": "Delete (soft) departments",
  "team:create": "Create teams",
  "team:update": "Update teams",
  "team:delete": "Delete teams",
  "jobtitle:manage": "Manage job titles",
  "skill:manage": "Manage the organization skill catalog",
  "audit:read": "Read the organization audit log"
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[];

/** System role keys created for every organization. Custom roles may be added later. */
export const ROLE_KEYS = ["owner", "admin", "member", "guest"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

/**
 * Default grants applied when an organization is created.
 * Stored in the database immediately; afterwards everything is DB-driven.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleKey, readonly Permission[]> = {
  owner: [...PERMISSION_KEYS],
  admin: [
    "organization:update",
    "member:view",
    "member:invite",
    "member:update",
    "member:remove",
    "department:create",
    "department:update",
    "department:delete",
    "team:create",
    "team:update",
    "team:delete",
    "jobtitle:manage",
    "skill:manage",
    "audit:read"
  ],
  member: ["member:view"],
  guest: []
};
