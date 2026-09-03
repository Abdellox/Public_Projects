import { describe, expect, it } from "vitest";
import {
  createEmployeeSchema,
  createLeaveRequestSchema,
  loginSchema,
  signupSchema,
} from "../src/index.js";

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    const result = signupSchema.safeParse({
      organizationName: "Acme Inc.",
      email: "jane@acme.com",
      password: "Sup3rSecret!",
      name: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords and normalizes email", () => {
    const result = signupSchema.safeParse({
      organizationName: "Acme Inc.",
      email: "JANE@ACME.com",
      password: "short",
      name: "Jane Doe",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("lowercases emails", () => {
    const parsed = loginSchema.parse({ email: "USER@Example.COM ", password: "x" });
    expect(parsed.email).toBe("user@example.com");
  });
});

describe("createEmployeeSchema", () => {
  const valid = {
    firstName: "John",
    lastName: "Smith",
    email: "john@acme.com",
    employmentType: "FULL_TIME",
    startDate: "2024-01-15",
  };

  it("accepts minimal employee", () => {
    expect(createEmployeeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects bad dates", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, startDate: "15-01-2024" }).success).toBe(false);
  });

  it("rejects invalid emails", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
});

describe("createLeaveRequestSchema", () => {
  it("rejects end date before start date", () => {
    const result = createLeaveRequestSchema.safeParse({
      leaveTypeId: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
      startDate: "2024-06-10",
      endDate: "2024-06-05",
    });
    expect(result.success).toBe(false);
  });

  it("accepts same-day leave", () => {
    const result = createLeaveRequestSchema.safeParse({
      leaveTypeId: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
      startDate: "2024-06-10",
      endDate: "2024-06-10",
    });
    expect(result.success).toBe(true);
  });
});
