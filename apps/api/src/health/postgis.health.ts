import { Inject, Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, type HealthIndicatorResult } from "@nestjs/terminus";
import { pingPostgis } from "@ridenow/db";
import type { Sql } from "postgres";
import { DB_SQL } from "../database/database.tokens";

/**
 * Terminus health indicator that confirms BOTH that Postgres answers a query
 * and that the PostGIS extension is installed and reachable — the readiness
 * signal the /health endpoint reports.
 */
@Injectable()
export class PostgisHealthIndicator extends HealthIndicator {
  constructor(@Inject(DB_SQL) private readonly sql: Sql) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const status = await pingPostgis(this.sql);
      return this.getStatus(key, true, { postgisVersion: status.postgisVersion });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError("PostGIS check failed", this.getStatus(key, false, { message }));
    }
  }
}
