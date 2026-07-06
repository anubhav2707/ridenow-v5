-- RideNow v5 initial schema.
-- Enables PostGIS and pre-shapes the nearest-driver geo query (geography(Point,4326)
-- + GiST index) so the feature stories drop their KNN/ST_DWithin queries in without
-- a migration rewrite. Money is integer minor units everywhere — never a float.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  display_name text NOT NULL,
  kyc_status text NOT NULL DEFAULT 'pending',
  is_online boolean NOT NULL DEFAULT false,
  last_location geography(Point, 4326),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Hot path for "nearest available driver": GiST index over the geography column.
CREATE INDEX IF NOT EXISTS drivers_last_location_gix
  ON drivers USING GIST (last_location);

CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders (id),
  driver_id uuid REFERENCES drivers (id),
  state text NOT NULL DEFAULT 'new',
  pickup geography(Point, 4326),
  dropoff geography(Point, 4326),
  fare_total_minor integer,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rides_state_idx ON rides (state);

CREATE TABLE IF NOT EXISTS earnings_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers (id),
  ride_id uuid REFERENCES rides (id),
  gross_minor integer NOT NULL,
  commission_minor integer NOT NULL,
  net_minor integer NOT NULL,
  commission_bps integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS earnings_ledger_driver_idx ON earnings_ledger (driver_id);
