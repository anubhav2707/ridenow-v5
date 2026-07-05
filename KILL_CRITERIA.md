# Kill criteria — RideNow v5

A green CI pipeline proves the **software** stands up. It does **not** prove the
**business** works. These criteria are pre-registered here, at scaffold time, so
that a passing build is never mistaken for product validation and so we know in
advance what evidence would make us stop.

## What "green" here does and does not mean

- **Does mean:** the walking skeleton installs from a committed lockfile, lints,
  typechecks, tests, and the full local stack (Postgres+PostGIS + API) boots and
  serves `/health` and the faked core loop.
- **Does NOT mean:** riders want the product, drivers will supply liquidity, or
  the unit economics survive real-world costs. All external providers are
  deterministic mocks; no real money, SMS, KYC, or map routing has happened.

## Kill / pivot criteria (marketplace)

Stop or pivot if, once real features and a pilot market exist, any of these hold:

1. **Two-sided liquidity fails.** In a chosen pilot geography we cannot sustain
   enough online drivers to hold median rider ETA under a usable threshold
   (e.g. > 10 min) at the demand we can generate — i.e. the chicken-and-egg
   never breaks even in one market.
2. **Unit economics are negative after real costs.** Per-trip contribution stays
   negative once *real* payment processing fees, insurance, driver incentives,
   support, and fraud/chargeback losses are loaded in — not just the modeled
   commission split. Transparent take-home that is honest but unviable is still
   unviable.
3. **Retention doesn't compound.** Neither riders nor drivers return at a rate
   that lets CAC be recovered within an acceptable payback window.

## Assumptions to validate before scaling (not before shipping the skeleton)

- Riders will accept an upfront, no-surge-surprise quote over incumbents.
- Drivers value transparent, exact take-home enough to switch supply.
- Keyless OSM routing (OSRM/Nominatim) is accurate enough for fare quoting in
  the pilot geography, or self-hosting is affordable.

## Explicitly out of scope for this scaffold (deferred, not decided)

Self-hosted OSRM/Nominatim, real Twilio OTP, real Stripe test-mode payments, and
all feature logic. Each lands behind the provider ports already wired here as a
DI/config swap, not a refactor.
