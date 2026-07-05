import { useMutation } from "@tanstack/react-query";
import { formatMoney, type LngLat } from "@ridenow/shared-types";
import { Map } from "./Map";
import { runFakedTrip } from "./api";

// Seeded SF pickup/dropoff — matches the deterministic drivers in the seed.
const PICKUP: LngLat = { lng: -122.4194, lat: 37.7749 };
const DROPOFF: LngLat = { lng: -122.4094, lat: 37.7849 };

/**
 * Rider walking-skeleton UI. Drives the FAKED core loop over the mock adapters
 * (quote -> book -> accept -> start -> complete) and shows the upfront fare, the
 * live driver-tracking map surface, and the transparent take-home split.
 */
export function App() {
  const trip = useMutation({ mutationFn: () => runFakedTrip(PICKUP, DROPOFF) });
  const quoted = trip.data?.quoted;
  const completed = trip.data?.completed;

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 480,
        margin: "2rem auto",
        padding: "0 1rem",
      }}
    >
      <h1>RideNow — Rider</h1>
      <p>Walking-skeleton demo — drives the faked core loop over the mock adapters.</p>

      <Map center={PICKUP} />

      <button
        onClick={() => trip.mutate()}
        disabled={trip.isPending}
        style={{ marginTop: 16, padding: "10px 16px", cursor: "pointer" }}
      >
        {trip.isPending ? "Requesting…" : "Request ride (upfront quote → complete)"}
      </button>

      {trip.isError && (
        <p style={{ color: "crimson" }}>Failed: {trip.error?.message ?? "unknown error"}</p>
      )}

      {quoted?.quote && (
        <section style={{ marginTop: 16 }}>
          <h2>Upfront fare</h2>
          <p>
            <strong>{formatMoney(quoted.quote.total)}</strong> — base{" "}
            {formatMoney(quoted.quote.baseFare)} + distance{" "}
            {formatMoney(quoted.quote.distanceComponent)} + time{" "}
            {formatMoney(quoted.quote.timeComponent)}
          </p>
        </section>
      )}

      {completed && (
        <section style={{ marginTop: 16 }}>
          <h2>Trip complete</h2>
          <p>State path: {completed.history.join(" → ")}</p>
          <p>Driver: {completed.driverId}</p>
          <p>
            Driver take-home: {formatMoney(completed.ledgerEntry.netTakeHome)} (platform fee{" "}
            {formatMoney(completed.ledgerEntry.commission)})
          </p>
        </section>
      )}
    </main>
  );
}
