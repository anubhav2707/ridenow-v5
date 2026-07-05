import { createSql, type Sql } from "./client.js";
import { loadEnv, getDatabaseUrl } from "./env.js";

/** Deterministic fixtures — a rider and two KYC-approved drivers near SF. */
const RIDERS = [{ phone: "+15551230001" }];

const DRIVERS = [
  { phone: "+15559990001", displayName: "Ada Driver", lng: -122.4194, lat: 37.7749 },
  { phone: "+15559990002", displayName: "Grace Driver", lng: -122.4094, lat: 37.7849 },
];

/**
 * Seed deterministic fixtures. Idempotent via ON CONFLICT so re-seeding a
 * populated DB yields the exact same rows.
 */
export async function runSeed(sql: Sql): Promise<void> {
  for (const r of RIDERS) {
    await sql`
      INSERT INTO riders (phone) VALUES (${r.phone})
      ON CONFLICT (phone) DO NOTHING`;
  }

  for (const d of DRIVERS) {
    await sql`
      INSERT INTO drivers (phone, display_name, kyc_status, is_online, last_location)
      VALUES (
        ${d.phone},
        ${d.displayName},
        'approved',
        true,
        ST_SetSRID(ST_MakePoint(${d.lng}, ${d.lat}), 4326)::geography
      )
      ON CONFLICT (phone) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        kyc_status = EXCLUDED.kyc_status,
        is_online = EXCLUDED.is_online,
        last_location = EXCLUDED.last_location`;
  }

  const drivers = await sql<{ count: string }[]>`SELECT count(*)::text AS count FROM drivers`;
  const riders = await sql<{ count: string }[]>`SELECT count(*)::text AS count FROM riders`;
  console.log(`[seed] ${riders[0]?.count ?? "0"} rider(s), ${drivers[0]?.count ?? "0"} driver(s) present`);
}

async function main(): Promise<void> {
  loadEnv();
  const sql = createSql(getDatabaseUrl());
  try {
    await runSeed(sql);
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  });
}
