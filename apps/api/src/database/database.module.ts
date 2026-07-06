import { Global, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { createSql, getDatabaseUrl, loadEnv } from "@ridenow/db";
import type { Sql } from "postgres";
import { DB_SQL } from "./database.tokens";

/**
 * Provides the single shared postgres.js client to the whole app. Global so any
 * feature module can inject DB_SQL without re-importing this module. The client
 * connects lazily, so the app boots even before Postgres is reachable — only a
 * query (e.g. /health) exercises the connection.
 */
@Global()
@Module({
  providers: [
    {
      provide: DB_SQL,
      useFactory: (): Sql => {
        loadEnv();
        return createSql(getDatabaseUrl());
      },
    },
  ],
  exports: [DB_SQL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DB_SQL) private readonly sql: Sql) {}

  async onApplicationShutdown(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}
