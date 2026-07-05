import { describe, it, expect } from "vitest";
import {
  HAPPY_PATH,
  applyEvent,
  nextState,
  isTerminal,
  canCancel,
  IllegalTransitionError,
  type TripState,
  type TripEvent,
} from "./trip-state.js";

describe("trip state machine", () => {
  it("drives the full happy path new -> completed in order", () => {
    const events: TripEvent[] = ["REQUEST", "QUOTE", "BOOK", "ACCEPT", "START", "COMPLETE"];
    const visited: TripState[] = ["new"];
    let state: TripState = "new";
    for (const event of events) {
      state = applyEvent(state, event);
      visited.push(state);
    }
    expect(visited).toEqual([...HAPPY_PATH]);
    expect(state).toBe("completed");
    expect(isTerminal(state)).toBe(true);
  });

  it("throws IllegalTransitionError on an out-of-order event", () => {
    expect(() => applyEvent("new", "COMPLETE")).toThrow(IllegalTransitionError);
    expect(nextState("completed", "START")).toBeNull();
  });

  it("allows cancellation only before the trip starts", () => {
    expect(canCancel("booked")).toBe(true);
    expect(applyEvent("booked", "CANCEL")).toBe("cancelled");
    expect(canCancel("started")).toBe(false);
    expect(nextState("started", "CANCEL")).toBeNull();
  });
});
