import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schema.js";

export type Sql = ReturnType<typeof postgres>;

/** A raw postgres.js client. Caller is responsible for `.end()`. */
export function createSql(databaseUrl: string): Sql {
  return postgres(databaseUrl, { max: 4, onnotice: () => {} });
}

/** A drizzle client bound to the schema, for typed queries in feature stories. */
export function createDb(databaseUrl: string) {
  const sql = createSql(databaseUrl);
  return { db: drizzle(sql, { schema }), sql };
}

export interface PostgisReadiness {
  ok: boolean;
  postgisVersion: string;
}

/**
 * Readiness probe used by the API /health endpoint: confirms both that Postgres
 * answers a query AND that the PostGIS extension is installed and reachable.
 */
export async function pingPostgis(sql: Sql): Promise<PostgisReadiness> {
  const rows = await sql<{ postgis_version: string }[]>`SELECT postgis_version() AS postgis_version`;
  const version = rows[0]?.postgis_version;
  if (!version) {
    throw new Error("PostGIS not available: postgis_version() returned no rows");
  }
  return { ok: true, postgisVersion: version };
}
