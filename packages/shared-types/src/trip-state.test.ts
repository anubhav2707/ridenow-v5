import { describe, it, expect } from "vitest";
import {
  HAPPY_PATH,
  applyEvent,
  nextState,
  isTerminal,
  IllegalTransitionError,
  type TripEvent,
} from "./trip-state.js";

const HAPPY_EVENTS: TripEvent[] = [
  "REQUEST",
  "QUOTE",
  "BOOK",
  "ACCEPT",
  "START",
  "COMPLETE",
];

describe("trip state machine", () => {
  it("drives the ordered happy path new->...->completed", () => {
    let state = HAPPY_PATH[0]!;
    const visited = [state];
    for (const event of HAPPY_EVENTS) {
      state = applyEvent(state, event);
      visited.push(state);
    }
    expect(visited).toEqual([...HAPPY_PATH]);
    expect(isTerminal(state)).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(nextState("new", "COMPLETE")).toBeNull();
    expect(() => applyEvent("completed", "START")).toThrow(
      IllegalTransitionError,
    );
  });

  it("allows cancelling only in-flight rides", () => {
    expect(applyEvent("requested", "CANCEL")).toBe("cancelled");
    expect(nextState("completed", "CANCEL")).toBeNull();
  });
});
