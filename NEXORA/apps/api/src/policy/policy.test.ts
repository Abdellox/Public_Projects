import { describe, expect, it } from "vitest";
import { PermissionCache } from "./policy";

describe("PermissionCache", () => {
  it("caches and returns permission sets per tenant/user pair", () => {
    const now = 1_000;
    const cache = new PermissionCache(60_000, () => now);

    cache.set("org1", "userA", new Set(["department:create"]));
    cache.set("org2", "userA", new Set([]));

    expect(cache.get("org1", "userA")?.has("department:create")).toBe(true);
    expect(cache.get("org2", "userA")?.size).toBe(0);
    expect(cache.get("org1", "userB")).toBeNull();
  });

  it("expires entries after the TTL", () => {
    let now = 1_000;
    const cache = new PermissionCache(60_000, () => now);
    cache.set("org1", "userA", new Set(["x"]));

    now += 59_999;
    expect(cache.get("org1", "userA")).not.toBeNull();
    now += 1;
    expect(cache.get("org1", "userA")).toBeNull();
  });

  it("invalidates a single user and entire organizations independently", () => {
    const now = 1_000;
    const cache = new PermissionCache(60_000, () => now);
    cache.set("org1", "userA", new Set(["a"]));
    cache.set("org1", "userB", new Set(["b"]));
    cache.set("org2", "userC", new Set(["c"]));

    cache.invalidate("org1", "userA");
    expect(cache.get("org1", "userA")).toBeNull();
    expect(cache.get("org1", "userB")).not.toBeNull();

    cache.invalidate("org2");
    expect(cache.get("org2", "userC")).toBeNull();
    expect(cache.get("org1", "userB")).not.toBeNull();
  });
});
