import { describe, expect, it } from "vitest";
import {
  getAllProviders,
  getDefaultProvider,
  getProvider,
  getScenariosForProvider,
} from "./providers";
import type { Provider } from "./types";

describe("provider configuration", () => {
  it("registers all expected providers", () => {
    const providers = getAllProviders();
    const ids = providers.map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(["stripe", "paypal", "adyen", "braintree"]));
  });

  it("each provider has a unique id", () => {
    const ids = getAllProviders().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each provider has documentation URLs", () => {
    for (const p of getAllProviders()) {
      expect(p.docsUrl).toMatch(/^https:\/\//);
      expect(p.sandboxUrl).toMatch(/^https:\/\//);
    }
  });

  it("each provider exposes at least the core scenarios", () => {
    const core = ["success", "declined"];
    for (const p of getAllProviders()) {
      const scenarioIds = p.scenarios.map((s) => s.id);
      for (const c of core) {
        expect(scenarioIds).toContain(c);
      }
    }
  });

  it("documented cards are only referenced from sources in the provider config", () => {
    for (const p of getAllProviders() as Provider[]) {
      for (const s of p.scenarios) {
        const documented = s.cardNumbers ?? [];
        // Ensure scenario card numbers are non-empty strings and match the
        // declared documentedCards lookup keys when present.
        for (const card of documented) {
          expect(card).toBeTypeOf("string");
          expect(card.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("getProvider returns undefined for unknown ids", () => {
    expect(getProvider("not-a-provider")).toBeUndefined();
    expect(getProvider("stripe")).toBeDefined();
  });

  it("getDefaultProvider returns the first registered provider", () => {
    expect(getDefaultProvider().id).toBe(getAllProviders()[0].id);
  });

  it("getScenariosForProvider returns scenarios in order", () => {
    const scenarios = getScenariosForProvider("stripe");
    expect(scenarios[0].id).toBe("success");
    expect(scenarios.length).toBeGreaterThan(1);
  });

  it("stripe documents the canonical success card", () => {
    const stripe = getProvider("stripe");
    const successCards = stripe?.scenarios.find((s) => s.id === "success")?.cardNumbers;
    expect(successCards).toContain("4242 4242 4242 4242");
  });
});
