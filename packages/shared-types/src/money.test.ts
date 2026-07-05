import { describe, it, expect } from "vitest";
import { money, addMoney, subtractMoney, applyBasisPoints, formatMoney } from "./money.js";

describe("money", () => {
  it("rejects non-integer minor units", () => {
    expect(() => money(10.5, "USD")).toThrow();
  });

  it("upper-cases the currency", () => {
    expect(money(100, "usd").currency).toBe("USD");
  });

  it("adds and subtracts within the same currency", () => {
    expect(addMoney(money(150, "USD"), money(99, "USD"))).toEqual({ amount: 249, currency: "USD" });
    expect(subtractMoney(money(150, "USD"), money(99, "USD"))).toEqual({
      amount: 51,
      currency: "USD",
    });
  });

  it("refuses cross-currency arithmetic", () => {
    expect(() => addMoney(money(100, "USD"), money(100, "EUR"))).toThrow(/currency mismatch/);
  });

  it("applies basis points with integer rounding", () => {
    // 20% of 1099 = 219.8 -> rounds to 220
    expect(applyBasisPoints(money(1099, "USD"), 2000)).toEqual({ amount: 220, currency: "USD" });
  });

  it("formats for display only", () => {
    expect(formatMoney(money(1099, "USD"))).toBe("USD 10.99");
  });
});
