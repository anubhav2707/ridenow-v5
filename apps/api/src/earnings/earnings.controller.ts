import { Controller, Get, Inject } from "@nestjs/common";
import type { Sql } from "postgres";
import { DB_SQL } from "../database/database.tokens";

interface LedgerRow {
  id: string;
  driver_id: string;
  ride_id: string | null;
  gross_minor: number;
  commission_minor: number;
  net_minor: number;
  commission_bps: number;
  currency: string;
}

/** Read-only earnings ledger — the transparent take-home the driver app shows. */
@Controller("earnings")
export class EarningsController {
  constructor(@Inject(DB_SQL) private readonly sql: Sql) {}

  @Get()
  async list(): Promise<LedgerRow[]> {
    return this.sql<LedgerRow[]>`
      SELECT id, driver_id, ride_id, gross_minor, commission_minor, net_minor, commission_bps, currency
      FROM earnings_ledger
      ORDER BY created_at DESC
      LIMIT 20`;
  }
}
