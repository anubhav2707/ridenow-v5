// Thin wrapper so `tsx scripts/reset.ts` (root `pnpm db:reset`) rebuilds the local
// DB deterministically. The guard against non-local DATABASE_URL lives in @ridenow/db.
import { runReset } from "@ridenow/db";

runReset().catch((err: unknown) => {
  console.error("[reset] failed:", err);
  process.exit(1);
});
