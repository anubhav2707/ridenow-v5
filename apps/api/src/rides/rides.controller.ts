import { Controller, Get, Inject } from "@nestjs/common";
import type { Sql } from "postgres";
import { DB_SQL } from "../database/database.tokens";

interface RideRow {
  id: string;
  state: string;
  fare_total_minor: number | null;
  currency: string;
}

/** Read-only recent rides — a seam over the persisted core-loop output. */
@Controller("rides")
export class RidesController {
  constructor(@Inject(DB_SQL) private readonly sql: Sql) {}

  @Get()
  async list(): Promise<RideRow[]> {
    return this.sql<RideRow[]>`
      SELECT id, state, fare_total_minor, currency
      FROM rides
      ORDER BY created_at DESC
      LIMIT 20`;
  }
}
