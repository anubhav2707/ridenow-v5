-- 0000_init — enable PostGIS and pre-shape the schema the feature stories need.
-- Authored by hand (drizzle-kit cannot emit CREATE EXTENSION) and applied by
-- src/migrate.ts. Idempotent so it is safe to re-run.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS riders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         text NOT NULL UNIQUE,
  display_name  text NOT NULL,
  kyc_status    text NOT NULL DEFAULT 'pending',
  is_online     boolean NOT NULL DEFAULT false,
  -- last known GPS ping; core to the nearest-driver query.
  last_location geography(Point, 4326),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- GiST index so the hot nearest-driver KNN / ST_DWithin query drops in later
-- without a migration rewrite.
CREATE INDEX IF NOT EXISTS drivers_last_location_gix
  ON drivers USING GIST (last_location);

CREATE TABLE IF NOT EXISTS rides (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id         uuid REFERENCES riders (id),
  driver_id        uuid REFERENCES drivers (id),
  state            text NOT NULL DEFAULT 'new',
  pickup           geography(Point, 4326),
  dropoff          geography(Point, 4326),
  -- integer minor units — never a float.
  fare_total_minor integer,
  currency         text NOT NULL DEFAULT 'USD',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS earnings_ledger (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id        uuid NOT NULL REFERENCES drivers (id),
  ride_id          uuid REFERENCES rides (id),
  gross_minor      integer NOT NULL,
  commission_minor integer NOT NULL,
  net_minor        integer NOT NULL,
  commission_bps   integer NOT NULL,
  currency         text NOT NULL DEFAULT 'USD',
  created_at       timestamptz NOT NULL DEFAULT now()
);
