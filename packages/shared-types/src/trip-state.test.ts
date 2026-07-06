import { describe, expect, it } from "vitest";
import {
  HAPPY_PATH,
  IllegalTransitionError,
  TRIP_STATES,
  applyEvent,
  canCancel,
  isTerminal,
  nextState,
} from "./trip-state.js";
import { computeFare, DEFAULT_TARIFF } from "./fare.js";
import { computeTakeHome, DEFAULT_COMMISSION_BPS } from "./earnings.js";
import { addMoney, money, subtractMoney } from "./money.js";

describe("trip-state machine", () => {
  it("drives the whole happy path new -> completed", () => {
    const events = ["REQUEST", "QUOTE", "BOOK", "ACCEPT", "START", "COMPLETE"] as const;
    let state = HAPPY_PATH[0]!;
    const visited = [state];
    for (const event of events) {
      state = applyEvent(state, event);
      visited.push(state);
    }
    expect(visited).toEqual([...HAPPY_PATH]);
    expect(isTerminal(state)).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(() => applyEvent("new", "COMPLETE")).toThrow(IllegalTransitionError);
    expect(nextState("completed", "CANCEL")).toBeNull();
  });

  it("only allows cancel from the cancellable states", () => {
    for (const state of TRIP_STATES) {
      const expected = ["requested", "quoted", "booked", "accepted"].includes(state);
      expect(canCancel(state)).toBe(expected);
    }
  });
});

describe("fare + earnings money math", () => {
  it("computes a deterministic upfront fare in integer minor units", () => {
    const quote = computeFare({ distanceMeters: 5000, durationSeconds: 600 }, DEFAULT_TARIFF);
    // 250 base + round(5 * 120) + round(10 * 30) = 250 + 600 + 300 = 1150
    expect(quote.total).toEqual(money(1150, "USD"));
    expect(Number.isInteger(quote.total.amount)).toBe(true);
  });

  it("splits gross into commission + take-home with no rounding drift", () => {
    const gross = money(1150, "USD");
    const { commission, netTakeHome } = computeTakeHome(gross, DEFAULT_COMMISSION_BPS);
    expect(commission).toEqual(money(230, "USD")); // 20%
    expect(netTakeHome).toEqual(money(920, "USD"));
    expect(addMoney(commission, netTakeHome)).toEqual(gross);
  });

  it("rejects a currency mismatch", () => {
    expect(() => subtractMoney(money(100, "USD"), money(1, "EUR"))).toThrow(/currency mismatch/);
  });
});
