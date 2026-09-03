import { z } from "zod";
import { isoDate, uuid } from "./common.js";
import { employmentTypeValues } from "./employees.js";

// ── Documents ────────────────────────────────────────────────────────────────

export const documentVisibility = z.enum(["PRIVATE", "HR_ONLY", "MANAGERS", "COMPANY"]);
export type DocumentVisibility = z.infer<typeof documentVisibility>;

export const uploadDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().max(60).default("other"),
  visibility: documentVisibility.default("PRIVATE"),
  employeeId: uuid.optional(),
  expiresAt: isoDate.nullable().optional(),
});

// ── Performance ──────────────────────────────────────────────────────────────

export const createGoalSchema = z.object({
  employeeId: uuid,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  dueDate: isoDate.nullable().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  dueDate: isoDate.nullable().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

export const createReviewCycleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  periodStart: isoDate,
  periodEnd: isoDate,
}).refine((v) => v.periodStart <= v.periodEnd, {
  message: "periodEnd must be on or after periodStart",
  path: ["periodEnd"],
});

export const submitReviewSchema = z.object({
  role: z.enum(["SELF", "MANAGER"]),
  rating: z.number().int().min(1).max(5).optional(),
  comments: z.string().trim().min(1).max(5000),
});

export const createFeedbackSchema = z.object({
  aboutEmployeeId: uuid,
  message: z.string().trim().min(1).max(2000),
  anonymous: z.boolean().default(false),
});

// ── Recruitment ──────────────────────────────────────────────────────────────

export const applicationStages = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;

export const createJobOpeningSchema = z.object({
  title: z.string().trim().min(1).max(150),
  departmentId: uuid.nullable().optional(),
  locationId: uuid.nullable().optional(),
  description: z.string().trim().max(10000).optional(),
  employmentType: z.enum(employmentTypeValues).default("FULL_TIME"),
  status: z.enum(["DRAFT", "OPEN", "PAUSED", "CLOSED"]).default("OPEN"),
});

export const updateJobOpeningSchema = createJobOpeningSchema.partial();

export const createCandidateSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(32).optional(),
  source: z.string().trim().max(80).optional(),
});

export const createApplicationSchema = z.object({
  jobId: uuid,
  candidateId: uuid,
  stage: z.enum(applicationStages).default("APPLIED"),
  note: z.string().trim().max(1000).optional(),
});

export const moveApplicationSchema = z.object({
  stage: z.enum(applicationStages),
  note: z.string().trim().max(1000).optional(),
});

export const scheduleInterviewSchema = z.object({
  scheduledAt: isoDate,
  durationMinutes: z.number().int().min(15).max(480).default(60),
  interviewerUserIds: z.array(uuid).min(1).max(10),
  meetingLink: z.string().trim().url().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const submitInterviewFeedbackSchema = z.object({
  recommendation: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().trim().min(1).max(3000),
});

// ── Training ─────────────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  category: z.string().trim().max(60).optional(),
  contentUrl: z.string().trim().url().max(1000).optional(),
  durationHours: z.number().min(0.5).max(2000).optional(),
  certificationValidMonths: z.number().int().min(1).max(120).nullable().optional(),
});

export const assignTrainingSchema = z.object({
  courseId: uuid,
  employeeIds: z.array(uuid).min(1).max(500),
  dueDate: isoDate,
});

export const completeTrainingSchema = z.object({
  completedAt: isoDate.optional(),
});
