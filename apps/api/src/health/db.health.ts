import { Inject, Injectable } from "@nestjs/common";
import {
  HealthIndicator,
  type HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import { pingPostgis, type Sql } from "@ridenow/db";
import { SQL } from "../database/database.module";

/**
 * Terminus health indicator confirming both that Postgres answers a query AND
 * that the PostGIS extension is installed and reachable — the readiness signal
 * the geo-heavy product depends on.
 */
@Injectable()
export class DbHealthIndicator extends HealthIndicator {
  constructor(@Inject(SQL) private readonly sql: Sql) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const { postgisVersion } = await pingPostgis(this.sql);
      return this.getStatus(key, true, { postgisVersion });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new HealthCheckError(
        "PostGIS check failed",
        this.getStatus(key, false, { message }),
      );
    }
  }
}
