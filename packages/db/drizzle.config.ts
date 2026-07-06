import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit config for the geo/feature stories. The skeleton applies raw SQL
 * migrations from ./migrations via src/migrate.ts; this config lets `drizzle-kit
 * generate` diff future schema changes against that same folder.
 */
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://ridenow:ridenow@localhost:5432/ridenow",
  },
});
