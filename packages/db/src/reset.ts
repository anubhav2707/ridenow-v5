import { createSql } from "./client.js";
import { loadEnv, getDatabaseUrl, assertLocalDatabase } from "./env.js";
import { runMigrations } from "./migrate.js";
import { runSeed } from "./seed.js";

/**
 * Deterministically rebuild the local database: drop our tables, re-run every
 * migration, then re-seed. REFUSES to touch a non-local DATABASE_URL.
 */
export async function runReset(): Promise<void> {
  loadEnv();
  const url = getDatabaseUrl();
  assertLocalDatabase(url);

  const sql = createSql(url);
  try {
    console.log("[reset] dropping tables");
    await sql.unsafe(
      "DROP TABLE IF EXISTS earnings_ledger, rides, drivers, riders, _migrations CASCADE",
    );
    console.log("[reset] re-migrating");
    await runMigrations(sql);
    console.log("[reset] re-seeding");
    await runSeed(sql);
    console.log("[reset] done — database rebuilt deterministically");
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  runReset().catch((err) => {
    console.error("[reset] failed:", err);
    process.exit(1);
  });
}
