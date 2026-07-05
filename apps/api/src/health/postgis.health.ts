import { Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, type HealthIndicatorResult } from "@nestjs/terminus";
import { DbReadiness } from "./db-readiness";

/** Terminus indicator confirming Postgres answers AND PostGIS is installed. */
@Injectable()
export class PostgisHealthIndicator extends HealthIndicator {
  constructor(private readonly db: DbReadiness) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const readiness = await this.db.check();
      return this.getStatus(key, true, { postgisVersion: readiness.postgisVersion });
    } catch (error) {
      throw new HealthCheckError(
        "postgis unavailable",
        this.getStatus(key, false, { message: (error as Error).message }),
      );
    }
  }
}
