import { computeTakeHome, formatMoney, money } from "@ridenow/shared-types";

/**
 * Driver app stub. Shows the transparent take-home split the earnings story
 * will wire to the real ledger. Uses the SHARED money/earnings contract so the
 * numbers can never drift from the API.
 */
export default function App() {
  const exampleGross = money(1150, "USD");
  const { commission, netTakeHome } = computeTakeHome(exampleGross);

  return (
    <main style={{ maxWidth: 480, margin: "3rem auto", fontFamily: "system-ui" }}>
      <h1>RideNow — Driver</h1>
      <p>Mock-KYC onboarding and ride acceptance land in the driver story.</p>
      <section aria-label="earnings-preview">
        <h2>Earnings preview</h2>
        <ul>
          <li>Gross fare: {formatMoney(exampleGross)}</li>
          <li>Platform commission: {formatMoney(commission)}</li>
          <li>
            <strong>Your take-home: {formatMoney(netTakeHome)}</strong>
          </li>
        </ul>
      </section>
    </main>
  );
}
