import { type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCoreLoop, formatMoney } from "./api";
import { MapView } from "./MapView";

export function App(): ReactElement {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["core-loop"],
    queryFn: fetchCoreLoop,
  });

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>RideNow — Driver</h1>
      <p>Accept rides, live GPS, and a transparent take-home ledger (walking-skeleton demo).</p>
      <MapView />
      <section style={{ marginTop: 16 }}>
        <button onClick={() => void refetch()}>Simulate a completed trip</button>
        {isLoading && <p>Loading…</p>}
        {error instanceof Error && <p style={{ color: "crimson" }}>Error: {error.message}</p>}
        {data && (
          <table style={{ marginTop: 12, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: 16 }}>Gross fare</td>
                <td>{formatMoney(data.ledgerEntry.gross)}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 16 }}>
                  Platform commission ({data.ledgerEntry.commissionBps} bps)
                </td>
                <td>−{formatMoney(data.ledgerEntry.commission)}</td>
              </tr>
              <tr style={{ fontWeight: 700 }}>
                <td style={{ paddingRight: 16 }}>Your take-home</td>
                <td>{formatMoney(data.ledgerEntry.netTakeHome)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
