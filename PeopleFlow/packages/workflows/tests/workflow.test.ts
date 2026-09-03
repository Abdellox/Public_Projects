import { describe, expect, it } from "vitest";
import { computeRunStatus, instantiateWorkflow, isOverdue } from "../src/index.js";

describe("instantiateWorkflow", () => {
  it("creates tasks with correct due dates", () => {
    const anchor = new Date("2024-03-01T00:00:00.000Z");
    const tasks = instantiateWorkflow(
      [
        { title: "Sign contract", offsetDays: 0, roleKey: "ASSIGNEE" },
        { title: "Meet manager", offsetDays: 1, roleKey: "MANAGER" },
        { title: "Issue equipment", offsetDays: -2, roleKey: "HR" },
      ],
      anchor,
    );
    expect(tasks).toHaveLength(3);
    expect(tasks[0]?.dueDate.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    expect(tasks[1]?.dueDate.toISOString()).toBe("2024-03-02T00:00:00.000Z");
    expect(tasks[2]?.dueDate.toISOString()).toBe("2024-02-28T00:00:00.000Z");
    expect(tasks[1]?.roleKey).toBe("MANAGER");
  });

  it("rejects invalid templates", () => {
    expect(() => instantiateWorkflow([], new Date())).toThrow();
    expect(() => instantiateWorkflow([{ title: "" }], new Date())).toThrow();
    expect(() => instantiateWorkflow([{ offsetDays: 99999 }], new Date())).toThrow();
  });
});

describe("computeRunStatus", () => {
  it("completes only when all tasks are done", () => {
    expect(computeRunStatus({ total: 3, done: 3 })).toBe("COMPLETED");
    expect(computeRunStatus({ total: 3, done: 2 })).toBe("RUNNING");
    expect(computeRunStatus({ total: 0, done: 0 })).toBe("COMPLETED");
  });
});

describe("isOverdue", () => {
  it("detects overdue tasks", () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    expect(isOverdue(new Date("2024-06-14T00:00:00.000Z"), now)).toBe(true);
    expect(isOverdue(new Date("2024-06-16T00:00:00.000Z"), now)).toBe(false);
  });
});
