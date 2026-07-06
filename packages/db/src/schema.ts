import {
  boolean,
  customType,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * PostGIS `geography(Point,4326)` column. Kept as a custom type so the hot
 * nearest-driver KNN / ST_DWithin query the geo story adds drops in without a
 * migration rewrite. Values are read/written through raw ST_* SQL in the
 * skeleton; the driver mapping lands with the query work.
 */
export const geographyPoint = customType<{ data: string }>({
  dataType() {
    return "geography(Point,4326)";
  },
});

export const riders = pgTable("riders", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  displayName: text("display_name").notNull(),
  // mock-KYC onboarding: 'pending' | 'approved' | 'rejected'
  kycStatus: text("kyc_status").notNull().default("pending"),
  isOnline: boolean("is_online").notNull().default(false),
  // last known GPS ping — GiST-indexed in the migration.
  lastLocation: geographyPoint("last_location"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rides = pgTable("rides", {
  id: uuid("id").primaryKey().defaultRandom(),
  riderId: uuid("rider_id").references(() => riders.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  state: text("state").notNull().default("new"),
  pickup: geographyPoint("pickup"),
  dropoff: geographyPoint("dropoff"),
  // fare stored as integer minor units — never a float.
  fareTotalMinor: integer("fare_total_minor"),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const earningsLedger = pgTable("earnings_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => drivers.id),
  rideId: uuid("ride_id").references(() => rides.id),
  grossMinor: integer("gross_minor").notNull(),
  commissionMinor: integer("commission_minor").notNull(),
  netMinor: integer("net_minor").notNull(),
  commissionBps: integer("commission_bps").notNull(),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const schema = { riders, drivers, rides, earningsLedger };
