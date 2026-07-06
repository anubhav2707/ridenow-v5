import { Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { createSql, pingPostgis } from "@ridenow/db";

/**
 * Readiness indicator for the /health endpoint. Confirms BOTH that Postgres
 * answers and that the PostGIS extension is installed/reachable. Connects with a
 * tiny pool per check so the API still boots (and reports "down") when the DB is
 * unavailable, rather than crashing at startup.
 */
@Injectable()
export class DbHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new HealthCheckError(
        "database check failed",
        this.getStatus(key, false, { message: "DATABASE_URL is not set" }),
      );
    }
    const sql = createSql(url);
    try {
      const readiness = await pingPostgis(sql);
      return this.getStatus(key, true, { postgisVersion: readiness.postgisVersion });
    } catch (err) {
      throw new HealthCheckError(
        "database check failed",
        this.getStatus(key, false, { message: err instanceof Error ? err.message : String(err) }),
      );
    } finally {
      await sql.end({ timeout: 1 });
    }
  }
}
