import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/passwords.js";
import {
  ALL_PERMISSIONS,
  hasAnyPermission,
  hasPermission,
  resolvePermissions,
} from "../src/permissions.js";
import {
  generateSessionToken,
  hashSessionToken,
  safeEqual,
} from "../src/tokens.js";

describe("passwords", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toContain("Sup3rSecret!");
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verifyPassword("Sup3rSecret!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
    expect(await verifyPassword("x", "garbage-hash")).toBe(false);
  });
});

describe("permissions", () => {
  it("wildcard grants everything", () => {
    const perms = resolvePermissions([["*"]]);
    expect(perms.size).toBe(ALL_PERMISSIONS.length);
    expect(hasPermission(perms, "salary.view")).toBe(true);
  });

  it("unions role permissions", () => {
    const perms = resolvePermissions([["employee.view"], ["leave.approve", "employee.view"]]);
    expect(hasPermission(perms, "employee.view")).toBe(true);
    expect(hasPermission(perms, "leave.approve")).toBe(true);
    expect(hasPermission(perms, "salary.view")).toBe(false);
    expect(hasAnyPermission(perms, ["salary.view", "leave.approve"])).toBe(true);
  });

  it("unknown keys are not granted implicitly", () => {
    const perms = resolvePermissions([["employee.view"]]);
    expect(hasPermission(perms, "made.up.key")).toBe(false);
  });
});

describe("tokens", () => {
  it("generates unique high-entropy tokens", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).toHaveLength(64);
    expect(a).not.toEqual(b);
  });

  it("hashes deterministically with the secret", () => {
    const t = generateSessionToken();
    expect(hashSessionToken(t, "s1")).toBe(hashSessionToken(t, "s1"));
    expect(hashSessionToken(t, "s1")).not.toBe(hashSessionToken(t, "s2"));
    expect(safeEqual(hashSessionToken(t, "s1"), hashSessionToken(t, "s1"))).toBe(true);
    expect(safeEqual("a".repeat(4), "b".repeat(4))).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
