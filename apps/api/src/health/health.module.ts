import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PostgisHealthIndicator } from "./postgis.health";
import { DbReadiness } from "./db-readiness";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PostgisHealthIndicator, DbReadiness],
})
export class HealthModule {}
