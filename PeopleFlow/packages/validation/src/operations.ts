import { z } from "zod";
import { isoDate, isoDateTime, uuid } from "./common.js";

// ── Leave ────────────────────────────────────────────────────────────────────

export const createLeaveTypeSchema = z.object({
  name: z.string().trim().min(1).max(60),
  annualAllowanceDays: z.number().min(0).max(365),
  carryOverMaxDays: z.number().min(0).max(365).default(0),
  paid: z.boolean().default(true),
  requiresApproval: z.boolean().default(true),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#6366f1"),
});

export const updateLeaveTypeSchema = createLeaveTypeSchema.partial();

export const createLeaveRequestSchema = z
  .object({
    leaveTypeId: uuid,
    startDate: isoDate,
    endDate: isoDate,
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.startDate <= v.endDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const decideLeaveRequestSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().max(500).optional(),
});

export const cancelLeaveRequestSchema = z.object({
  note: z.string().trim().max(500).optional(),
});

export const listLeaveRequestsQuery = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  employeeId: uuid.optional(),
  departmentId: uuid.optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  scope: z.enum(["mine", "team", "all"]).default("mine"),
});

// ── Attendance ───────────────────────────────────────────────────────────────

export const clockActionSchema = z.object({
  at: isoDateTime.optional(),
  note: z.string().trim().max(200).optional(),
});

export const manualAttendanceSchema = z.object({
  employeeId: uuid,
  date: isoDate,
  clockIn: z.string().regex(/^\d{2}:\d{2}$/),
  clockOut: z.string().regex(/^\d{2}:\d{2}$/),
  breakMinutes: z.number().int().min(0).max(720).default(0),
  note: z.string().trim().max(200).optional(),
});

export const listAttendanceQuery = z.object({
  employeeId: uuid.optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(31),
});

export const upsertWorkScheduleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  days: z.array(
    z.object({
      day: z.number().int().min(0).max(6), // 0 = Sunday … 6 = Saturday
      enabled: z.boolean(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
      endTime: z.string().regex(/^\d{2}:\d{2}$/).default("17:00"),
    }),
  ).length(7),
});

export const createHolidaySchema = z.object({
  name: z.string().trim().min(1).max(100),
  date: isoDate,
  locationId: uuid.nullable().optional(),
});

// ── Tasks & workflows ────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  assigneeEmployeeId: uuid.nullable().optional(),
  dueDate: isoDate.nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  workflowRunId: uuid.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  assigneeEmployeeId: uuid.nullable().optional(),
  dueDate: isoDate.nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
});

export const createWorkflowTemplateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  trigger: z.enum(["MANUAL", "ONBOARDING", "OFFBOARDING"]),
  steps: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        description: z.string().trim().max(1000).optional(),
        offsetDays: z.number().int().min(-365).max(365).default(0),
        roleKey: z.enum(["ASSIGNEE", "MANAGER", "HR"]).default("HR"),
      }),
    )
    .min(1)
    .max(50),
});

export const runWorkflowSchema = z.object({
  templateId: uuid,
  employeeId: uuid,
});
