import { Test } from "@nestjs/testing";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { DbHealthIndicator } from "./db.health";

describe("HealthController", () => {
  it("returns status 'ok' with the PostGIS version when the DB is reachable", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        {
          provide: DbHealthIndicator,
          useValue: {
            isHealthy: async () => ({
              database: { status: "up", postgisVersion: "3.4 USE_GEOS=1" },
            }),
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const result = await controller.check();

    expect(result.status).toBe("ok");
    expect(result.details.database?.status).toBe("up");
    expect(result.details.database?.postgisVersion).toContain("3.4");
  });

  it("reports 'error' when the DB indicator fails", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        {
          provide: DbHealthIndicator,
          useValue: {
            isHealthy: async () => {
              throw Object.assign(new Error("db down"), {
                causes: { database: { status: "down" } },
              });
            },
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    await expect(controller.check()).rejects.toBeDefined();
  });
});
