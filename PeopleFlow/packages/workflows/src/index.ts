import { z } from "zod";

export const workflowStepSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  /** Days relative to the run's anchor date (employee start date or offboarding date). */
  offsetDays: z.number().int().min(-365).max(365).default(0),
  roleKey: z.enum(["ASSIGNEE", "MANAGER", "HR"]).default("HR"),
});

export type WorkflowStep = z.infer<typeof workflowStepSchema>;

export interface TaskSpec {
  title: string;
  description?: string;
  dueDate: Date;
  roleKey: WorkflowStep["roleKey"];
}

export function instantiateWorkflow(steps: unknown, anchorDate: Date): TaskSpec[] {
  const parsed = z.array(workflowStepSchema).min(1).parse(steps);
  return parsed.map((step) => {
    const dueDate = new Date(anchorDate.getTime());
    dueDate.setUTCDate(dueDate.getUTCDate() + step.offsetDays);
    return {
      title: step.title,
      ...(step.description ? { description: step.description } : {}),
      dueDate,
      roleKey: step.roleKey,
    };
  });
}

export interface RunProgressInput {
  total: number;
  done: number;
}

export type RunStatus = "RUNNING" | "COMPLETED";

export function computeRunStatus({ total, done }: RunProgressInput): RunStatus {
  if (total <= 0) return "COMPLETED";
  return done >= total ? "COMPLETED" : "RUNNING";
}

export function isOverdue(dueDate: Date, now: Date = new Date()): boolean {
  return dueDate.getTime() < now.getTime();
}
