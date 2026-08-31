import { describe, expect, it } from "vitest";
import { movementDelta } from "@supplyflow/database";

describe("movementDelta", () => {
  it("inbound movements are positive", () => {
    expect(movementDelta("receipt", 10)).toBe(10);
    expect(movementDelta("transfer_in", 5)).toBe(5);
    expect(movementDelta("return_customer", 3)).toBe(3);
  });

  it("outbound movements are negative", () => {
    expect(movementDelta("shipment", 10)).toBe(-10);
    expect(movementDelta("transfer_out", 7)).toBe(-7);
    expect(movementDelta("return_supplier", 2)).toBe(-2);
    expect(movementDelta("damage", 4)).toBe(-4);
  });

  it("adjustment increases stock (decreases use damage/return_supplier)", () => {
    expect(movementDelta("adjustment", 6)).toBe(6);
  });

  it("rejects zero, negative and non-finite quantities", () => {
    expect(() => movementDelta("receipt", 0)).toThrow();
    expect(() => movementDelta("shipment", -5)).toThrow();
    expect(() => movementDelta("adjustment", Number.NaN)).toThrow();
    expect(() => movementDelta("receipt", Number.POSITIVE_INFINITY)).toThrow();
  });

  it("transfer pair nets to zero", () => {
    const out = movementDelta("transfer_out", 25);
    const into = movementDelta("transfer_in", 25);
    expect(out + into).toBe(0);
  });
});
