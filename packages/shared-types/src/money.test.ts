import { describe, it, expect } from "vitest";
import { money, addMoney, subtractMoney, applyBasisPoints } from "./money.js";

describe("money", () => {
  it("rejects non-integer minor units at runtime", () => {
    expect(() => money(10.5, "USD")).toThrow();
  });

  it("upper-cases the currency code", () => {
    expect(money(100, "usd").currency).toBe("USD");
  });

  it("adds and subtracts within a currency", () => {
    expect(addMoney(money(100, "USD"), money(250, "USD")).amount).toBe(350);
    expect(subtractMoney(money(250, "USD"), money(100, "USD")).amount).toBe(150);
  });

  it("refuses cross-currency arithmetic", () => {
    expect(() => addMoney(money(100, "USD"), money(100, "EUR"))).toThrow();
  });

  it("splits commission with no rounding drift", () => {
    const gross = money(1099, "USD");
    const commission = applyBasisPoints(gross, 2000); // 20%
    const net = subtractMoney(gross, commission);
    expect(commission.amount + net.amount).toBe(gross.amount);
  });
});
