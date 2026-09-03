import { describe, expect, it } from "vitest";
import { workingDaysBetween } from "../src/services/leave.js";

describe("workingDaysBetween", () => {
  it("counts weekdays only", () => {
    const monday = new Date("2024-06-03T00:00:00.000Z");
    const friday = new Date("2024-06-07T00:00:00.000Z");
    expect(workingDaysBetween(monday, friday)).toBe(5);
  });

  it("excludes weekends inside the range", () => {
    const friday = new Date("2024-06-07T00:00:00.000Z");
    const monday = new Date("2024-06-10T00:00:00.000Z");
    expect(workingDaysBetween(friday, monday)).toBe(2);
  });

  it("returns zero for inverted ranges and single weekend days", () => {
    expect(
      workingDaysBetween(new Date("2024-06-10T00:00:00.000Z"), new Date("2024-06-05T00:00:00.000Z")),
    ).toBe(0);
    expect(workingDaysBetween(new Date("2024-06-08T00:00:00.000Z"), new Date("2024-06-09T00:00:00.000Z"))).toBe(0);
  });
});
