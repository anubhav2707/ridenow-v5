# Kill criteria — RideNow v5

Pre-registered so a **green pipeline is never mistaken for product validation**. The
scaffold proves the stack *runs*; it proves nothing about whether the marketplace *works*.
These are the conditions under which we stop, pivot, or shut the product down.

## 1. Two-sided liquidity

A ride-hailing marketplace is worthless without both sides present at the same time/place.

- **Kill if** in a chosen launch geo we cannot reach the liquidity floor where the median
  rider request finds an available driver within a target ETA (e.g. **< 7 min**) for a
  sustained period — despite incentive spend.
- **Watch:** requests-with-no-driver rate, driver idle time, rider request→match rate.

## 2. Unit economics (with REAL costs)

The faked loop uses a 20% take rate and zero real costs. Real economics must include
insurance, payment processing (Stripe), support, incentives, and driver churn.

- **Kill if** fully-loaded contribution margin per completed trip stays **negative** at
  realistic take rates that riders and drivers both tolerate, with no credible path to
  positive as volume grows.
- **Watch:** contribution margin/trip **after** insurance + payment fees + incentives;
  CAC payback for both riders and drivers.

## 3. Regulatory / insurance viability

- **Kill if** operating legally in the target market requires licensing or per-trip
  insurance whose cost structurally breaks criterion #2, with no viable alternative.

## What a green CI does and does NOT mean

- ✅ The stack builds, types check, tests pass, and the stack boots on localhost.
- ✅ The faked core loop transitions a trip new→completed and produces a ledger entry.
- ❌ It does **not** mean riders want it, drivers will supply it, or the economics close.

Revisit this document at every feature story and before any launch decision.
