import { Controller, Get, Inject } from "@nestjs/common";
import type { Sql } from "postgres";
import { DB_SQL } from "../database/database.tokens";

interface DriverRow {
  id: string;
  display_name: string;
  kyc_status: string;
  is_online: boolean;
}

/**
 * Read-only driver listing — a thin seam over the seeded drivers so the stack
 * is browsable. Onboarding/KYC behaviour lands with the drivers story.
 */
@Controller("drivers")
export class DriversController {
  constructor(@Inject(DB_SQL) private readonly sql: Sql) {}

  @Get()
  async list(): Promise<DriverRow[]> {
    return this.sql<DriverRow[]>`
      SELECT id, display_name, kyc_status, is_online
      FROM drivers
      ORDER BY created_at`;
  }
}
