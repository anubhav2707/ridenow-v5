import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  type HealthCheckResult,
} from "@nestjs/terminus";
import { DbHealthIndicator } from "./db.health";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DbHealthIndicator,
  ) {}

  /**
   * Readiness probe. Returns 200 when Postgres + PostGIS are reachable, 503
   * otherwise. Consumed by docker-compose, the CI smoke gate, and the deploy
   * health check.
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.db.isHealthy("database")]);
  }
}
