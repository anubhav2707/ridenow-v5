import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, type HealthCheckResult } from "@nestjs/terminus";
import { PostgisHealthIndicator } from "./postgis.health";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly postgis: PostgisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.postgis.isHealthy("postgis")]);
  }
}
