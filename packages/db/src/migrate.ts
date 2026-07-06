import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createSql, type Sql } from "./client.js";
import { loadEnv, getDatabaseUrl } from "./env.js";

const MIGRATIONS_DIR = resolve(__dirname, "..", "migrations");

function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

/**
 * Apply every pending .sql migration in order, tracking applied names in a
 * `_migrations` table so the operation is idempotent and re-runnable.
 */
export async function runMigrations(sql: Sql): Promise<string[]> {
  await sql`CREATE TABLE IF NOT EXISTS _migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;

  const appliedRows = await sql<{ name: string }[]>`SELECT name FROM _migrations`;
  const applied = new Set(appliedRows.map((r) => r.name));

  const ran: string[] = [];
  for (const file of migrationFiles()) {
    if (applied.has(file)) continue;
    const contents = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(contents);
      await tx`INSERT INTO _migrations (name) VALUES (${file})`;
    });
    ran.push(file);
    console.log(`[migrate] applied ${file}`);
  }

  if (ran.length === 0) {
    console.log("[migrate] nothing to apply — schema is up to date");
  }
  return ran;
}

async function main(): Promise<void> {
  loadEnv();
  const sql = createSql(getDatabaseUrl());
  try {
    await runMigrations(sql);
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[migrate] failed:", err);
    process.exit(1);
  });
}
