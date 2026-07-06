import { describe, it, expect } from "vitest";
import { computeFare, DEFAULT_TARIFF } from "./fare.js";
import { computeTakeHome } from "./earnings.js";

describe("fare + earnings", () => {
  it("computes a deterministic upfront quote in integer minor units", () => {
    const route = { distanceMeters: 5000, durationSeconds: 600 }; // 5km, 10min
    const quote = computeFare(route);
    // base 250 + 5km*120 (600) + 10min*30 (300) = 1150
    expect(quote.total.amount).toBe(1150);
    expect(Number.isInteger(quote.total.amount)).toBe(true);
    expect(quote.currency).toBe(DEFAULT_TARIFF.currency);
    // same input => same output
    expect(computeFare(route).total.amount).toBe(quote.total.amount);
  });

  it("splits a fare into commission + take-home that sum to gross", () => {
    const quote = computeFare({ distanceMeters: 5000, durationSeconds: 600 });
    const { commission, netTakeHome } = computeTakeHome(quote.total);
    expect(commission.amount + netTakeHome.amount).toBe(quote.total.amount);
    expect(commission.amount).toBe(230); // 20% of 1150
  });
});
