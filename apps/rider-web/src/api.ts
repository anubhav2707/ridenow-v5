import type { EarningsLedgerEntry, FareQuote, LngLat, TripState } from "@ridenow/shared-types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export interface RideView {
  rideId: string;
  state: TripState;
  history: TripState[];
  quote: FareQuote | null;
  driverId: string | null;
}

export interface AcceptResult extends RideView {
  startOtp: string;
}

export interface CompleteResult extends RideView {
  ledgerEntry: EarningsLedgerEntry;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  // Build the body/headers conditionally: exactOptionalPropertyTypes forbids
  // assigning `undefined` to RequestInit's optional `body`.
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    ...(body === undefined
      ? {}
      : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    throw new Error(`${path} responded ${res.status}`);
  }
  return (await res.json()) as T;
}

export interface FakedTrip {
  quoted: RideView;
  accepted: AcceptResult;
  completed: CompleteResult;
}

/** Drive the faked core loop through the API and return each milestone. */
export async function runFakedTrip(pickup: LngLat, dropoff: LngLat): Promise<FakedTrip> {
  const quoted = await post<RideView>("/rides/quote", { pickup, dropoff });
  await post<RideView>(`/rides/${quoted.rideId}/book`);
  const accepted = await post<AcceptResult>(`/rides/${quoted.rideId}/accept`);
  await post<RideView>(`/rides/${quoted.rideId}/start`, { otp: accepted.startOtp });
  const completed = await post<CompleteResult>(`/rides/${quoted.rideId}/complete`);
  return { quoted, accepted, completed };
}
