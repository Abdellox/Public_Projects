import { describe, expect, it } from "vitest";
import { generateCustomer, generateTestData } from "./generator";
import { getAllProviders } from "./providers";

describe("customer data generator", () => {
  it("generates a full customer with all required fields", () => {
    const c = generateCustomer();
    expect(c.firstName).toBeTruthy();
    expect(c.lastName).toBeTruthy();
    expect(c.fullName).toBe(`${c.firstName} ${c.lastName}`);
    expect(c.email).toMatch(/@/);
    expect(c.phone).toMatch(/^\+1/);
    expect(c.address.line1).toBeTruthy();
    expect(c.address.city).toBeTruthy();
    expect(c.address.state).toBeTruthy();
    expect(c.address.zip).toMatch(/^\d{5}$/);
    expect(c.address.country).toBeTruthy();
  });

  it("generates distinct customers on repeated calls", () => {
    const a = generateCustomer();
    const b = generateCustomer();
    // emails are distinct
    expect(a.email).not.toBe(b.email);
  });

  it("uses clearly synthetic email domains", () => {
    for (let i = 0; i < 20; i++) {
      const c = generateCustomer();
      expect(c.email).toMatch(
        /@(test\.example|sandbox\.invalid|mock\.local|fixture\.dev)$/,
      );
    }
  });

  it("generates fake names that are not real-looking personal data", () => {
    // Surnames come from a controlled list of obvious fake names.
    const c = generateCustomer();
    expect(c.lastName).toMatch(/Test|Sandbox|Mock|Fixture|Dev|Dummy|Sample|Placeholder|Preview|Staged|Simulacra|Doppel|Mockson|Qa/i);
  });
});

describe("test data generator", () => {
  it("defaults to the first provider and first scenario", () => {
    const data = generateTestData({});
    const first = getAllProviders()[0];
    expect(data.provider).toBe(first.id);
    expect(data.scenario).toBe(first.scenarios[0].id);
  });

  it("accepts a valid provider", () => {
    const data = generateTestData({ provider: "adyen" });
    expect(data.provider).toBe("adyen");
  });

  it("falls back to the default provider for unknown ids", () => {
    const data = generateTestData({ provider: "nope" });
    expect(data.provider).toBe(getAllProviders()[0].id);
  });

  it("selects a matching scenario when provided", () => {
    const data = generateTestData({ provider: "stripe", scenario: "declined" });
    expect(data.scenario).toBe("declined");
    expect(data.card?.number).toBe("4000 0000 0000 0002");
  });

  it("marks card data as documented only when the provider lists it", () => {
    const data = generateTestData({ provider: "stripe", scenario: "declined" });
    expect(data.card?.isDocumented).toBe(true);
  });

  it("returns null card data when the provider documents no number for scenario", () => {
    // Stripe documents numbers for all scenarios; pick paypal's insufficient-funds
    // which is not documented.
    const data = generateTestData({
      provider: "paypal",
      scenario: "insufficient-funds",
    });
    expect(data.card).toBeNull();
  });

  it("only ever emits card numbers that exist in the provider config", () => {
    for (const p of getAllProviders()) {
      const data = generateTestData({
        provider: p.id,
        scenario: p.scenarios[0].id,
      });
      if (data.card?.number) {
        const allowed = p.scenarios
          .flatMap((s) => s.cardNumbers ?? [])
          .map((n) => n.replace(/\s/g, ""));
        expect(allowed).toContain(data.card.number.replace(/\s/g, ""));
      }
    }
  });

  it("always flags safety metadata as sandbox-only", () => {
    const data = generateTestData({});
    expect(data.safety.sandboxOnly).toBe(true);
    expect(data.safety.disclaimer).toContain("SANDBOX");
  });

  it("never produces a real Luhn-computed card outside the documented set", () => {
    // This is a guard: card numbers must come from the documented config,
    // never generated/guessed.
    const data = generateTestData({ provider: "stripe", scenario: "success" });
    const documented = ["4242424242424242", "4000003800000002", "4000002760003184"];
    expect(documented).toContain(data.card?.number?.replace(/\s/g, ""));
  });
});
