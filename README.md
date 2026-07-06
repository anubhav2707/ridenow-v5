# RideNow v5

Greenfield rider + driver ride-hailing product, built as a **walking skeleton** that
every downstream feature story extends. TypeScript monorepo (pnpm workspaces + Turborepo)
with a NestJS/Fastify API, two Vite + React + MapLibre web apps, and Postgres + PostGIS.

> **This is a scaffold, not a product.** No feature logic is implemented. The core loop
> runs as a **faked** vertical slice over deterministic mock adapters. See
> [`KILL_CRITERIA.md`](./KILL_CRITERIA.md) — a green pipeline is not product validation.

## Layout

```
apps/
  api/          NestJS (Fastify) — /health (Terminus), faked core loop, stub domain modules
  rider-web/    Vite + React + MapLibre (keyless OSM tiles) + TanStack Query
  driver-web/   Vite + React + MapLibre — transparent earnings ledger view
packages/
  shared-types/ Zod schemas: money (integer minor units), fare, earnings, trip state machine
  db/           Drizzle schema + raw SQL migrations (PostGIS), client, migrate/seed/reset
  config/       Shared ESLint flat config + Prettier
```

Everything external (OTP / payments / geo) sits behind an injectable **port** with a
deterministic **mock adapter** as the default (`ConsoleOtp`, `FakePayment`, `StubGeo`).
Swapping to a real adapter (Twilio, Stripe, OSRM/Nominatim) is a later DI/config change,
not a refactor. Money is **always** integer minor units. The drivers table carries a
`geography(Point,4326)` column with a GiST index so the nearest-driver query drops in later.

## Requirements

- Node 20 LTS (see `.nvmrc`), pnpm (pinned via `packageManager` — `corepack enable`)
- Docker + Docker Compose (for the local stack)

## Install (committed lockfile)

```bash
pnpm install --frozen-lockfile
```

## Quality gates (also run in CI)

```bash
pnpm run lint        # ESLint (flat config) across all packages
pnpm run typecheck   # strict tsc --noEmit across all packages
pnpm run test        # vitest (shared-types) + jest (api, incl. /health)
pnpm run build       # turbo build of every package
```

## Run the full stack with one command

```bash
make up      # docker compose up (Postgres+PostGIS + API), wait for /health, migrate + seed
make demo    # curl the faked core loop and watch the trip-state transitions + ledger
make down    # tear the stack down (removes volumes)
```

`make demo` (or `bash scripts/watch-loop.sh`) prints:

```
new -> requested -> quoted -> booked -> accepted -> started -> completed
fare: total USD 11.50 ...
earnings: gross USD 11.50, commission USD 2.30 (2000 bps), net take-home USD 9.20
```

## Database

```bash
make migrate   # apply pending SQL migrations (idempotent)
make seed      # deterministic fixtures (1 rider, 2 KYC-approved drivers near SF)
make reset     # drop + re-migrate + re-seed — REFUSES any non-local DATABASE_URL
```

Locally, `pnpm db:reset` runs `scripts/reset.ts` against your `.env` `DATABASE_URL`.

## Deploy (human-gated)

The API container is deploy-ready (`fly.toml` → `apps/api/Dockerfile`). Provisioning the
reachable URL and its secrets is a **human-gated** step — **no secrets are committed**.
Once deployed, `GET /health` must return `200`.

## Configuration

Copy `.env.example` to `.env`. All provider flags default to `mock`; Twilio/Stripe keys
stay blank in dev. Real `.env` is gitignored.
