import type { Config } from "drizzle-kit";

/**
 * drizzle-kit config. The committed migrations under ./migrations are the
 * source of truth (they include raw PostGIS DDL drizzle-kit cannot generate);
 * `db:generate` is available for feature stories that add plain columns.
 */
export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://ridenow:ridenow@localhost:5432/ridenow",
  },
} satisfies Config;
