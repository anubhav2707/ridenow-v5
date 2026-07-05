import type { Config } from "drizzle-kit";

/**
 * drizzle-kit config. The committed migration under ./migrations is authored by
 * hand (it must `CREATE EXTENSION postgis` and shape the geography column) and
 * is applied by src/migrate.ts. drizzle-kit is wired here for the future
 * `generate`/`studio` flow the geo story will lean on.
 */
export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://ridenow:ridenow@localhost:5432/ridenow",
  },
} satisfies Config;
