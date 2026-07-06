import { Test } from "@nestjs/testing";
import {
  TerminusModule,
  HealthCheckError,
  type HealthIndicatorResult,
} from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { DbHealthIndicator } from "./db.health";

/**
 * Covers the /health readiness contract without a live database by overriding
 * the PostGIS indicator. The real indicator's query is exercised by the
 * compose-up smoke gate in CI.
 */
describe("HealthController", () => {
  async function build(indicator: Partial<DbHealthIndicator>) {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [{ provide: DbHealthIndicator, useValue: indicator }],
    }).compile();
    return moduleRef.get(HealthController);
  }

  it("returns ok with a PostGIS readiness payload when reachable", async () => {
    const healthy: HealthIndicatorResult = {
      database: { status: "up", postgisVersion: "3.4 USE_GEOS=1" },
    };
    const isHealthy = jest.fn().mockResolvedValue(healthy);
    const controller = await build({ isHealthy });

    const result = await controller.check();

    expect(result.status).toBe("ok");
    expect(result.info?.database?.status).toBe("up");
    expect(result.info?.database?.postgisVersion).toContain("3.4");
    expect(isHealthy).toHaveBeenCalledWith("database");
  });

  it("fails the check when PostGIS is unreachable", async () => {
    const isHealthy = jest.fn().mockRejectedValue(
      new HealthCheckError("PostGIS check failed", {
        database: { status: "down", message: "connection refused" },
      }),
    );
    const controller = await build({ isHealthy });

    await expect(controller.check()).rejects.toBeDefined();
  });
});
