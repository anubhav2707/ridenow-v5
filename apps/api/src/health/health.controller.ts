import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, HealthCheckResult } from "@nestjs/terminus";
import { DbHealthIndicator } from "./db.health";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DbHealthIndicator,
  ) {}

  /** GET /health — 200 when Postgres + PostGIS are reachable, 503 otherwise. */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.db.isHealthy("database")]);
  }
}
