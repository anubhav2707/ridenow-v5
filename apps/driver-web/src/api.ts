import type {
  EarningsLedgerEntry,
  FareQuote,
  LngLat,
  TripState,
} from "@ridenow/shared-types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/** The deterministic driver the mock matcher assigns (mirrors the seed). */
export const SEEDED_DRIVER_ID = "drv_ada";

async function req<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  // Build the body/headers conditionally: exactOptionalPropertyTypes forbids
  // assigning `undefined` to RequestInit's optional `body`/`headers`.
  const res = await fetch(`${BASE}${path}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    throw new Error(`${path} responded ${res.status}`);
  }
  return (await res.json()) as T;
}

interface RideView {
  rideId: string;
  state: TripState;
  history: TripState[];
  quote: FareQuote | null;
  driverId: string | null;
}
interface AcceptResult extends RideView {
  startOtp: string;
}
interface CompleteResult extends RideView {
  ledgerEntry: EarningsLedgerEntry;
}

export function getEarnings(driverId: string): Promise<EarningsLedgerEntry[]> {
  return req<EarningsLedgerEntry[]>(`/earnings/${driverId}`, "GET");
}

// A seeded pickup/dropoff near the seeded drivers.
const PICKUP: LngLat = { lng: -122.4194, lat: 37.7749 };
const DROPOFF: LngLat = { lng: -122.4094, lat: 37.7849 };

/**
 * Simulate a driver working one trip end-to-end over the faked core loop so a
 * fresh, transparent ledger entry appears for the driver.
 */
export async function driveOneTrip(): Promise<CompleteResult> {
  const quoted = await req<RideView>("/rides/quote", "POST", { pickup: PICKUP, dropoff: DROPOFF });
  await req<RideView>(`/rides/${quoted.rideId}/book`, "POST");
  const accepted = await req<AcceptResult>(`/rides/${quoted.rideId}/accept`, "POST");
  await req<RideView>(`/rides/${quoted.rideId}/start`, "POST", { otp: accepted.startOtp });
  return req<CompleteResult>(`/rides/${quoted.rideId}/complete`, "POST");
}
