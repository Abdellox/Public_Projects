/**
 * Fine-grained permission catalog. Roles hold arrays of these keys; "*" grants
 * everything. All enforcement is server-side — see apps/api/src/context.ts.
 */
export const PERMISSION_CATALOG = {
  "employee.view": "View employee directory and profiles",
  "employee.create": "Create employees",
  "employee.update": "Update employees",
  "employee.delete": "Delete / archive employees",
  "salary.view": "View compensation records",
  "salary.update": "Manage compensation records",
  "leave.request": "Request leave for self",
  "leave.approve": "Approve or reject leave requests",
  "leave.viewAll": "View leave data of all employees",
  "attendance.clock": "Clock in / out",
  "attendance.viewAll": "View attendance of all employees",
  "attendance.manage": "Correct attendance entries",
  "document.upload": "Upload documents",
  "document.viewAll": "Access documents across the organization (HR scope)",
  "document.manage": "Manage document permissions and lifecycle",
  "performance.viewAll": "View goals/reviews beyond own reports",
  "performance.manage": "Run review cycles and manage goals",
  "recruitment.manage": "Manage jobs, candidates, applications",
  "training.manage": "Manage courses and assignments",
  "announcement.publish": "Publish company announcements",
  "workflow.manage": "Manage workflow templates and runs",
  "task.manage": "Assign tasks to others",
  "role.manage": "Manage roles and permissions",
  "member.manage": "Invite/remove organization members",
  "org.settings": "Manage organization settings",
  "report.view": "Access analytics and reports",
  "data.import": "Run CSV imports",
  "data.export": "Export data (audited)",
  "audit.view": "Read the audit log",
  "ai.use": "Use the AI assistant",
} as const;

export type PermissionKey = keyof typeof PERMISSION_CATALOG;

export const ALL_PERMISSIONS = Object.keys(PERMISSION_CATALOG) as PermissionKey[];

/** Resolve the effective permission set from a list of role permission arrays. */
export function resolvePermissions(rolePermissionLists: string[][]): Set<string> {
  const effective = new Set<string>();
  for (const list of rolePermissionLists) {
    if (list.includes("*")) return new Set(ALL_PERMISSIONS);
    for (const p of list) effective.add(p);
  }
  return effective;
}

export function hasPermission(effective: ReadonlySet<string>, key: string): boolean {
  return effective.has("*") || effective.has(key);
}

export function hasAnyPermission(effective: ReadonlySet<string>, keys: string[]): boolean {
  return keys.some((k) => hasPermission(effective, k));
}
