import { z } from "zod";

/**
 * The canonical trip lifecycle — the single source of truth shared by the API
 * and both web apps. Downstream feature stories add behaviour to each state but
 * MUST NOT redefine the states or the legal transitions here.
 */
export const TRIP_STATES = [
  "new",
  "requested",
  "quoted",
  "booked",
  "accepted",
  "started",
  "completed",
  "cancelled",
] as const;

export const TripStateSchema = z.enum(TRIP_STATES);
export type TripState = z.infer<typeof TripStateSchema>;

export const TRIP_EVENTS = [
  "REQUEST",
  "QUOTE",
  "BOOK",
  "ACCEPT",
  "START",
  "COMPLETE",
  "CANCEL",
] as const;

export const TripEventSchema = z.enum(TRIP_EVENTS);
export type TripEvent = z.infer<typeof TripEventSchema>;

/** The one ordered happy path the faked core loop drives end-to-end. */
export const HAPPY_PATH: readonly TripState[] = [
  "new",
  "requested",
  "quoted",
  "booked",
  "accepted",
  "started",
  "completed",
];

const CANCELLABLE: readonly TripState[] = ["requested", "quoted", "booked", "accepted"];

/** state -> event -> next state. The exhaustive legal-transition table. */
const TRANSITIONS: Readonly<Record<TripState, Partial<Record<TripEvent, TripState>>>> = {
  new: { REQUEST: "requested" },
  requested: { QUOTE: "quoted", CANCEL: "cancelled" },
  quoted: { BOOK: "booked", CANCEL: "cancelled" },
  booked: { ACCEPT: "accepted", CANCEL: "cancelled" },
  accepted: { START: "started", CANCEL: "cancelled" },
  started: { COMPLETE: "completed" },
  completed: {},
  cancelled: {},
};

export function isTerminal(state: TripState): boolean {
  return state === "completed" || state === "cancelled";
}

export function canCancel(state: TripState): boolean {
  return CANCELLABLE.includes(state);
}

/** The next state for (state, event), or null if the transition is illegal. */
export function nextState(state: TripState, event: TripEvent): TripState | null {
  return TRANSITIONS[state][event] ?? null;
}

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: TripState,
    readonly event: TripEvent,
  ) {
    super(`illegal trip transition: cannot apply ${event} while ${from}`);
    this.name = "IllegalTransitionError";
  }
}

/** Apply an event, throwing IllegalTransitionError on an illegal transition. */
export function applyEvent(state: TripState, event: TripEvent): TripState {
  const next = nextState(state, event);
  if (next === null) {
    throw new IllegalTransitionError(state, event);
  }
  return next;
}
