import { TerminusModule } from "@nestjs/terminus";
import { Test } from "@nestjs/testing";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import type { Sql } from "postgres";
import { DB_SQL } from "../database/database.tokens";
import { HealthController } from "./health.controller";
import { PostgisHealthIndicator } from "./postgis.health";

/**
 * A fake postgres.js `Sql` tag that answers the postgis_version() probe without
 * a real database, so the readiness endpoint's real logic (controller ->
 * indicator -> pingPostgis) is exercised in a passing unit test.
 */
function fakeSql(rows: unknown[]): Sql {
  const tag = (): Promise<unknown[]> => Promise.resolve(rows);
  return tag as unknown as Sql;
}

describe("GET /health", () => {
  let app: NestFastifyApplication;

  async function boot(sql: Sql): Promise<NestFastifyApplication> {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [PostgisHealthIndicator, { provide: DB_SQL, useValue: sql }],
    }).compile();

    const nestApp = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await nestApp.init();
    await nestApp.getHttpAdapter().getInstance().ready();
    return nestApp;
  }

  afterEach(async () => {
    await app?.close();
  });

  it("returns 200 and a readiness payload confirming PostGIS is reachable", async () => {
    app = await boot(fakeSql([{ postgis_version: "3.4 USE_GEOS=1 USE_PROJ=1" }]));

    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("ok");
    expect(body.info.postgis.status).toBe("up");
    expect(body.info.postgis.postgisVersion).toContain("3.4");
  });

  it("returns 503 when PostGIS is not reachable", async () => {
    app = await boot(fakeSql([])); // no postgis_version row -> pingPostgis throws

    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(503);
    expect(res.json().status).toBe("error");
  });
});
