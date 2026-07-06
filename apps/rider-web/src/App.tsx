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
      <h1>RideNow — Rider</h1>
      <p>Upfront transparent fare quote + live driver tracking (walking-skeleton demo).</p>
      <MapView />
      <section style={{ marginTop: 16 }}>
        <button onClick={() => void refetch()}>Get a quote (run core loop)</button>
        {isLoading && <p>Loading…</p>}
        {error instanceof Error && <p style={{ color: "crimson" }}>Error: {error.message}</p>}
        {data && (
          <div>
            <p>
              <strong>Trip:</strong> {data.transitions.join(" → ")}
            </p>
            <p>
              <strong>Upfront fare:</strong> {formatMoney(data.quote.total)} for{" "}
              {(data.quote.distanceMeters / 1000).toFixed(2)} km
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
