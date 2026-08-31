import { describe, expect, it } from "vitest";
import { computeStockPosition } from "@supplyflow/database";

const base = {
  onHand: 0,
  reserved: 0,
  openAsnQty: 0,
  openPoQty: 0,
  forecastMonthlyDemand: null as number | null,
  trailingShippedUnits: 0,
  minStock: null as number | null,
  reorderPoint: null as number | null,
  reorderQuantity: null as number | null
};

describe("computeStockPosition", () => {
  it("healthy stock with no demand yields no suggestion and no cover days", () => {
    const p = computeStockPosition({ ...base, onHand: 100 });
    expect(p.risk).toBe("healthy");
    expect(p.available).toBe(100);
    expect(p.projected).toBe(100);
    expect(p.recommendedOrderQty).toBeNull();
    expect(p.daysOfCover).toBeNull();
  });

  it("reserved units reduce availability", () => {
    const p = computeStockPosition({ ...base, onHand: 50, reserved: 30, reorderPoint: 10 });
    expect(p.available).toBe(20);
    expect(p.risk).toBe("healthy");
  });

  it("out_of_stock when reservations consume everything", () => {
    const p = computeStockPosition({ ...base, onHand: 10, reserved: 12 });
    expect(p.risk).toBe("out_of_stock");
    expect(p.available).toBe(-2);
    expect(p.recommendedOrderQty).toBeGreaterThan(0);
  });

  it("critical when forecast demand wipes out projected supply", () => {
    const p = computeStockPosition({
      ...base,
      onHand: 40,
      forecastMonthlyDemand: 60
    });
    expect(p.projected).toBe(-20);
    expect(p.risk).toBe("critical");
    expect(p.daysOfCover).toBe(20);
  });

  it("critical when below minimum stock even if projection is positive", () => {
    const p = computeStockPosition({
      ...base,
      onHand: 5,
      minStock: 10,
      reorderPoint: 15
    });
    expect(p.risk).toBe("critical");
  });

  it("low risk sits between healthy and critical", () => {
    const p = computeStockPosition({
      ...base,
      onHand: 18,
      reorderPoint: 20
    });
    expect(p.risk).toBe("low");
  });

  it("incoming counts the max of open ASN qty and open PO qty (no double counting)", () => {
    const p = computeStockPosition({ ...base, onHand: 100, openAsnQty: 80, openPoQty: 120 });
    expect(p.incoming).toBe(120);
    expect(p.projected).toBe(220);
  });

  it("forecast demand wins over trailing shipped volume; zero forecasts fall back", () => {
    const withForecast = computeStockPosition({
      ...base, onHand: 100, forecastMonthlyDemand: 90, trailingShippedUnits: 500
    });
    expect(withForecast.projected).toBe(10);

    const fallback = computeStockPosition({
      ...base, onHand: 100, forecastMonthlyDemand: 0, trailingShippedUnits: 500
    });
    expect(fallback.projected).toBe(-400);
  });

  it("reorder suggestion targets max(reorderPoint, 2×minStock) minus projection", () => {
    const p = computeStockPosition({
      ...base,
      onHand: 30,
      forecastMonthlyDemand: 25,
      reorderPoint: 50
    });
    // projected = 5, target = 50 → suggest 45
    expect(p.risk).not.toBe("healthy");
    expect(p.recommendedOrderQty).toBe(45);
  });

  it("reorderQuantity acts as a floor for suggestions", () => {
    const p = computeStockPosition({
      ...base,
      onHand: 30,
      reorderPoint: 40,
      reorderQuantity: 100
    });
    expect(p.risk).toBe("low");
    expect(p.recommendedOrderQty).toBeGreaterThanOrEqual(100);
  });

  it("suggestion never goes negative when projection exceeds target", () => {
    const p = computeStockPosition({
      ...base,
      onHand: 5,
      minStock: 10,
      openPoQty: 500
    });
    expect(p.risk).toBe("critical"); // below min stock…
    expect(p.recommendedOrderQty).toBe(0); // …but plenty already inbound
  });

  it("daysOfCover uses available stock over daily demand rate", () => {
    const p = computeStockPosition({
      ...base,
      onHand: 90,
      reserved: 0,
      forecastMonthlyDemand: 30 // 1/day → 90 days
    });
    expect(p.daysOfCover).toBe(90);
  });
});
