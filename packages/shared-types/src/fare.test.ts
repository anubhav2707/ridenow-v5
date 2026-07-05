import { describe, it, expect } from "vitest";
import { computeFare, DEFAULT_TARIFF } from "./fare.js";
import { computeTakeHome } from "./earnings.js";

describe("fare + earnings", () => {
  it("computes a deterministic upfront quote in integer minor units", () => {
    // 5 km over 10 minutes on the default USD tariff.
    const quote = computeFare({ distanceMeters: 5000, durationSeconds: 600 });
    expect(quote.baseFare.amount).toBe(DEFAULT_TARIFF.baseFareMinor); // 250
    expect(quote.distanceComponent.amount).toBe(600); // 5 km * 120
    expect(quote.timeComponent.amount).toBe(300); // 10 min * 30
    expect(quote.total.amount).toBe(1150);
    expect(Number.isInteger(quote.total.amount)).toBe(true);
  });

  it("splits the fare into commission + take-home that sum back to gross", () => {
    const quote = computeFare({ distanceMeters: 5000, durationSeconds: 600 });
    const { commission, netTakeHome } = computeTakeHome(quote.total);
    expect(commission.amount + netTakeHome.amount).toBe(quote.total.amount);
    expect(commission.amount).toBe(230); // 20% of 1150
    expect(netTakeHome.amount).toBe(920);
  });
});
