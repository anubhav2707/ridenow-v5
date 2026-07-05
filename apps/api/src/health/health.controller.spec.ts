import { Test } from "@nestjs/testing";
import { HealthModule } from "./health.module";
import { HealthController } from "./health.controller";
import { DbReadiness } from "./db-readiness";

describe("HealthController", () => {
  it("reports ok when Postgres + PostGIS are reachable", async () => {
    const moduleRef = await Test.createTestingModule({ imports: [HealthModule] })
      .overrideProvider(DbReadiness)
      .useValue({ check: async () => ({ ok: true, postgisVersion: "3.4 (mock)" }) })
      .compile();

    const controller = moduleRef.get(HealthController);
    const result = await controller.check();

    expect(result.status).toBe("ok");
    expect(result.info?.postgis?.status).toBe("up");
    expect(result.details.postgis).toMatchObject({
      status: "up",
      postgisVersion: "3.4 (mock)",
    });

    await moduleRef.close();
  });

  it("fails the health check when the PostGIS probe throws", async () => {
    const moduleRef = await Test.createTestingModule({ imports: [HealthModule] })
      .overrideProvider(DbReadiness)
      .useValue({
        check: async () => {
          throw new Error("connection refused");
        },
      })
      .compile();

    const controller = moduleRef.get(HealthController);
    await expect(controller.check()).rejects.toBeDefined();

    await moduleRef.close();
  });
});
