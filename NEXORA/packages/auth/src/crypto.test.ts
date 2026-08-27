import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/password.js";
import { generateSessionToken, hashToken, safeEqual } from "../src/tokens.js";

describe("password hashing", () => {
  it("round-trips a valid password", async () => {
    const h = await hashPassword("correct horse battery 9");
    expect(h).not.toContain("correct");
    await expect(verifyPassword(h, "correct horse battery 9")).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const h = await hashPassword("correct horse battery 9");
    await expect(verifyPassword(h, "wrong horse battery 9")).resolves.toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const [a, b] = await Promise.all([hashPassword("same-password-1"), hashPassword("same-password-1")]);
    expect(a).not.toEqual(b);
  });
});

describe("session tokens", () => {
  it("generates url-safe high-entropy tokens", () => {
    const t = generateSessionToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(t).not.toEqual(generateSessionToken());
  });

  it("hashes tokens deterministically and never stores the raw token", () => {
    const t = generateSessionToken();
    const h = hashToken(t);
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(t)).toEqual(h);
    expect(h).not.toContain(t);
  });

  it("compares secrets in constant time", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
