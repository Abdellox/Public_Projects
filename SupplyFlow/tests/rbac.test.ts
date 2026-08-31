import { describe, expect, it } from "vitest";
import { ROLES, ROLE_PERMISSIONS, hasPermission, canWriteModule, type Permission } from "@supplyflow/types";

const WRITE_PERMISSIONS: Permission[] = [
  "org.manage", "members.manage",
  "products.write", "suppliers.write", "warehouses.write",
  "inventory.write", "purchasing.write",
  "shipments.inbound.write", "orders.write", "shipments.outbound.write",
  "planning.write", "collaboration.write"
];

describe("RBAC matrix", () => {
  it("owner passes every permission via wildcard", () => {
    for (const p of WRITE_PERMISSIONS) expect(hasPermission("owner", p)).toBe(true);
    expect(hasPermission("owner", "audit.read")).toBe(true);
    expect(hasPermission("owner", "reports.read")).toBe(true);
  });

  it("admin has org + member management and audit access", () => {
    expect(hasPermission("admin", "org.manage")).toBe(true);
    expect(hasPermission("admin", "members.manage")).toBe(true);
    expect(hasPermission("admin", "audit.read")).toBe(true);
  });

  it("every role can read core data", () => {
    for (const role of ROLES) {
      expect(hasPermission(role, "products.read")).toBe(true);
      expect(hasPermission(role, "inventory.read")).toBe(true);
      expect(hasPermission(role, "purchasing.read")).toBe(true);
    }
  });

  it("viewer cannot write anything anywhere", () => {
    for (const p of WRITE_PERMISSIONS) expect(hasPermission("viewer", p)).toBe(false);
    expect(canWriteModule("viewer", "products")).toBe(false);
    expect(canWriteModule("viewer", "purchasing")).toBe(false);
  });

  it("buyer owns purchasing but not warehouses or inventory", () => {
    expect(hasPermission("buyer", "purchasing.write")).toBe(true);
    expect(hasPermission("buyer", "shipments.inbound.write")).toBe(true);
    expect(hasPermission("buyer", "warehouses.write")).toBe(false);
    expect(hasPermission("buyer", "inventory.write")).toBe(false);
    expect(hasPermission("buyer", "orders.write")).toBe(false);
  });

  it("manager runs warehouse operations but cannot edit suppliers", () => {
    expect(hasPermission("manager", "shipments.inbound.write")).toBe(true);
    expect(hasPermission("manager", "shipments.outbound.write")).toBe(true);
    expect(hasPermission("manager", "inventory.write")).toBe(true);
    expect(hasPermission("manager", "suppliers.write")).toBe(false);
    expect(hasPermission("manager", "audit.read")).toBe(false);
  });

  it("planner plans products but does not execute logistics writes", () => {
    expect(hasPermission("planner", "planning.write")).toBe(true);
    expect(hasPermission("planner", "products.write")).toBe(true);
    expect(hasPermission("planner", "shipments.inbound.write")).toBe(false);
    expect(hasPermission("planner", "shipments.outbound.write")).toBe(false);
  });

  it("only owner and admin manage members", () => {
    const managers = ROLES.filter((r) => hasPermission(r, "members.manage"));
    expect(managers).toEqual(["owner", "admin"]);
  });

  it("every role defines a non-empty permission set", () => {
    for (const role of ROLES) {
      const granted = ROLE_PERMISSIONS[role];
      expect(granted === "*" || granted.length > 0).toBe(true);
    }
  });
});
