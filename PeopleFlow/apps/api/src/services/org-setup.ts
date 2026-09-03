import { prisma } from "@peopleflow/database";

const DEFAULT_ROLES = [
  {
    name: "Owner",
    systemKey: "owner",
    isSystem: true,
    permissions: ["*"],
  },
  { name: "Administrator", systemKey: "administrator", isSystem: true, permissions: ["*"] },
  {
    name: "HR Manager",
    systemKey: "hr_manager",
    isSystem: true,
    permissions: [
      "employee.view", "employee.create", "employee.update", "employee.delete",
      "salary.view", "salary.update",
      "leave.request", "leave.approve", "leave.viewAll",
      "attendance.clock", "attendance.viewAll", "attendance.manage",
      "document.upload", "document.manage", "document.viewAll",
      "performance.manage", "performance.viewAll",
      "recruitment.manage",
      "training.manage",
      "announcement.publish",
      "workflow.manage",
      "task.manage",
      "report.view",
      "data.import", "data.export",
      "audit.view", "role.manage", "member.manage", "org.settings",
    ],
  },
  {
    name: "Manager",
    systemKey: "manager",
    isSystem: true,
    permissions: [
      "employee.view", "leave.request", "leave.approve",
      "attendance.clock", "attendance.viewAll",
      "performance.manage", "task.manage", "document.upload",
    ],
  },
  {
    name: "Employee",
    systemKey: "employee",
    isSystem: true,
    permissions: ["leave.request", "attendance.clock"],
  },
];

const DEFAULT_STATUSES = [
  { name: "Active", category: "ACTIVE" as const, color: "#22c55e", isDefault: true },
  { name: "On leave", category: "ON_LEAVE" as const, color: "#f59e0b", isDefault: false },
  { name: "Suspended", category: "SUSPENDED" as const, color: "#ef4444", isDefault: false },
  { name: "Terminated", category: "TERMINATED" as const, color: "#64748b", isDefault: false },
];

const DEFAULT_LEAVE_TYPES = [
  { name: "Annual Leave", annualAllowanceDays: 25, carryOverMaxDays: 5, paid: true, requiresApproval: true, color: "#6366f1" },
  { name: "Sick Leave", annualAllowanceDays: 10, carryOverMaxDays: 0, paid: true, requiresApproval: false, color: "#ef4444" },
  { name: "Personal Leave", annualAllowanceDays: 3, carryOverMaxDays: 0, paid: true, requiresApproval: true, color: "#14b8a6" },
];

export async function provisionOrganization(organizationId: string): Promise<void> {
  await prisma.role.createMany({
    data: DEFAULT_ROLES.map((r) => ({ ...r, organizationId })),
  });
  await prisma.employeeStatusDef.createMany({
    data: DEFAULT_STATUSES.map((s) => ({ ...s, organizationId })),
  });
  await prisma.leaveType.createMany({
    data: DEFAULT_LEAVE_TYPES.map((t) => ({ ...t, organizationId })),
  });
  await prisma.workSchedule.create({
    data: {
      organizationId,
      name: "Standard Week",
      isDefault: true,
      days: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        enabled: i >= 1 && i <= 5,
        startTime: "09:00",
        endTime: "17:00",
      })),
    } as never,
  });
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "org";
}
