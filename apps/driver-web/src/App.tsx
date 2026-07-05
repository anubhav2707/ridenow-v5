import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMoney, type LngLat } from "@ridenow/shared-types";
import { Map } from "./Map";
import { driveOneTrip, getEarnings, SEEDED_DRIVER_ID } from "./api";

// The seeded driver's last known location near SF.
const DRIVER_LOCATION: LngLat = { lng: -122.4194, lat: 37.7749 };

/**
 * Driver walking-skeleton UI. Shows the transparent earnings ledger (exact
 * take-home per trip) and lets the driver work one faked trip to watch a new
 * ledger entry land.
 */
export function App() {
  const queryClient = useQueryClient();
  const ledger = useQuery({
    queryKey: ["earnings", SEEDED_DRIVER_ID],
    queryFn: () => getEarnings(SEEDED_DRIVER_ID),
  });
  const work = useMutation({
    mutationFn: driveOneTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["earnings", SEEDED_DRIVER_ID] }),
  });

  const entries = ledger.data ?? [];
  const takeHomeTotal = entries.reduce((sum, e) => sum + e.netTakeHome.amount, 0);
  const currency = entries[0]?.netTakeHome.currency ?? "USD";

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 520,
        margin: "2rem auto",
        padding: "0 1rem",
      }}
    >
      <h1>RideNow — Driver</h1>
      <p>Walking-skeleton demo — your transparent take-home ledger.</p>

      <Map center={DRIVER_LOCATION} />

      <button
        onClick={() => work.mutate()}
        disabled={work.isPending}
        style={{ marginTop: 16, padding: "10px 16px", cursor: "pointer" }}
      >
        {work.isPending ? "Working…" : "Accept + complete one trip"}
      </button>

      {work.isError && (
        <p style={{ color: "crimson" }}>Failed: {work.error?.message ?? "unknown error"}</p>
      )}

      <section style={{ marginTop: 16 }}>
        <h2>
          Earnings ledger — take-home {formatMoney({ amount: takeHomeTotal, currency })}
        </h2>
        {ledger.isLoading && <p>Loading…</p>}
        {!ledger.isLoading && entries.length === 0 && <p>No trips yet.</p>}
        {entries.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Ride</th>
                <th style={{ textAlign: "right" }}>Gross</th>
                <th style={{ textAlign: "right" }}>Fee</th>
                <th style={{ textAlign: "right" }}>Take-home</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.entryId}>
                  <td>{e.rideId.slice(0, 8)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(e.gross)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(e.commission)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(e.netTakeHome)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
