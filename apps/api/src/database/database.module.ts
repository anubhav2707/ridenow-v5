import { Global, Module } from "@nestjs/common";
import { createSql, type Sql } from "@ridenow/db";
import { loadApiConfig } from "../config/env";

/** DI token for the shared postgres.js client. */
export const SQL = Symbol("SQL");

/**
 * Provides a single lazy postgres.js client to the whole app. postgres.js does
 * not open a socket until the first query, so constructing this at boot is safe
 * even when the DB is not yet reachable (the /health endpoint reports on that).
 */
@Global()
@Module({
  providers: [
    {
      provide: SQL,
      useFactory: (): Sql => createSql(loadApiConfig().databaseUrl),
    },
  ],
  exports: [SQL],
})
export class DatabaseModule {}
