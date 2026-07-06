import { Inject, Injectable } from "@nestjs/common";
import type { LngLat, Money, TripState } from "@ridenow/shared-types";
import type { Sql } from "postgres";
import { DB_SQL } from "../database/database.tokens";

export interface CreateRideInput {
  pickup: LngLat;
  dropoff: LngLat;
  currency: string;
}

export interface RecordEarningsInput {
  driverId: string;
  rideId: string;
  gross: Money;
  commission: Money;
  netTakeHome: Money;
  commissionBps: number;
}

export interface StoredLedgerEntry {
  entryId: string;
  driverId: string;
  rideId: string;
  gross: Money;
  commission: Money;
  netTakeHome: Money;
  commissionBps: number;
  createdAt: string;
}

/**
 * Persistence port for the faked core loop. A Postgres adapter backs it in the
 * running stack; unit tests inject an in-memory fake so the orchestration is
 * verified without a database.
 */
export interface CoreLoopStore {
  pickOnlineDriver(): Promise<string>;
  createRide(input: CreateRideInput): Promise<{ id: string }>;
  setRideState(rideId: string, state: TripState, fareTotalMinor?: number): Promise<void>;
  assignDriver(rideId: string, driverId: string): Promise<void>;
  recordEarnings(input: RecordEarningsInput): Promise<StoredLedgerEntry>;
}

export const CORE_LOOP_STORE = Symbol("CORE_LOOP_STORE");

/** Postgres/PostGIS-backed CoreLoopStore used by the running stack. */
@Injectable()
export class PgCoreLoopStore implements CoreLoopStore {
  constructor(@Inject(DB_SQL) private readonly sql: Sql) {}

  async pickOnlineDriver(): Promise<string> {
    const rows = await this.sql<{ id: string }[]>`
      SELECT id FROM drivers WHERE is_online = true ORDER BY created_at LIMIT 1`;
    const id = rows[0]?.id;
    if (!id) throw new Error("no online driver available — run the seed first");
    return id;
  }

  async createRide(input: CreateRideInput): Promise<{ id: string }> {
    const rows = await this.sql<{ id: string }[]>`
      INSERT INTO rides (rider_id, state, pickup, dropoff, currency)
      VALUES (
        (SELECT id FROM riders ORDER BY created_at LIMIT 1),
        'new',
        ST_SetSRID(ST_MakePoint(${input.pickup.lng}, ${input.pickup.lat}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${input.dropoff.lng}, ${input.dropoff.lat}), 4326)::geography,
        ${input.currency}
      )
      RETURNING id`;
    const id = rows[0]?.id;
    if (!id) throw new Error("failed to insert ride");
    return { id };
  }

  async setRideState(rideId: string, state: TripState, fareTotalMinor?: number): Promise<void> {
    if (fareTotalMinor === undefined) {
      await this.sql`UPDATE rides SET state = ${state}, updated_at = now() WHERE id = ${rideId}`;
    } else {
      await this.sql`
        UPDATE rides
        SET state = ${state}, fare_total_minor = ${fareTotalMinor}, updated_at = now()
        WHERE id = ${rideId}`;
    }
  }

  async assignDriver(rideId: string, driverId: string): Promise<void> {
    await this.sql`UPDATE rides SET driver_id = ${driverId}, updated_at = now() WHERE id = ${rideId}`;
  }

  async recordEarnings(input: RecordEarningsInput): Promise<StoredLedgerEntry> {
    const rows = await this.sql<{ id: string; created_at: Date }[]>`
      INSERT INTO earnings_ledger
        (driver_id, ride_id, gross_minor, commission_minor, net_minor, commission_bps, currency)
      VALUES (
        ${input.driverId}, ${input.rideId},
        ${input.gross.amount}, ${input.commission.amount}, ${input.netTakeHome.amount},
        ${input.commissionBps}, ${input.gross.currency}
      )
      RETURNING id, created_at`;
    const row = rows[0];
    if (!row) throw new Error("failed to insert earnings ledger entry");
    return {
      entryId: row.id,
      driverId: input.driverId,
      rideId: input.rideId,
      gross: input.gross,
      commission: input.commission,
      netTakeHome: input.netTakeHome,
      commissionBps: input.commissionBps,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    };
  }
}
