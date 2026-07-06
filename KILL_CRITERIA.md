# RideNow v5 — Pre-registered Kill Criteria

A green CI pipeline proves the **software** works. It does **not** prove the
**business** works. These criteria are registered up front, at scaffold time, so
that later a passing test suite is never mistaken for product/market validation.
Ride-hailing is a two-sided marketplace with brutal unit economics; kill early
if the numbers below don't hold.

## 1. Two-sided liquidity
- **Kill if** in a target launch zone we cannot sustain a median rider
  request-to-match time under ~5 minutes with < 10% unfulfilled requests during
  peak, at any realistic driver supply we can actually recruit.
- Rationale: without both sides showing up at the same place and time, every
  other metric is vanity. Liquidity is the product.

## 2. Unit economics with REAL costs
- **Kill if** contribution margin per completed trip is negative once ALL real
  costs are included, with no credible path to positive at scale:
  - payment processing (Stripe) fees on the gross fare,
  - insurance / driver liability,
  - support + dispute + chargeback cost,
  - incentives/subsidies required to keep both sides active.
- The scaffold models money as exact integer minor units and commission in basis
  points precisely so these numbers can be measured without rounding drift — but
  the *default 20% take rate is a placeholder*, not a validated margin.

## 3. Regulatory / trust wall
- **Kill if** mandatory driver background checks, local licensing, or insurance
  requirements make legal operation infeasible or uneconomic in target markets.

## What this scaffold deliberately does NOT prove
- That anyone wants the product (no demand signal).
- That drivers will accept the take-home the ledger computes.
- That the mock OTP/payment/geo adapters reflect real-world latency, failure
  rates, or cost.

Revisit these before investing in the feature stories that build on this repo.
