// Repo-level entry point for the destructive LOCAL database reset (referenced by
// the acceptance criteria as `scripts/reset.ts`). It delegates to the guarded
// implementation in @ridenow/db, which drops our tables, re-migrates and
// re-seeds deterministically and REFUSES to run against any non-local
// DATABASE_URL. Run it with `pnpm db:reset` (or `pnpm exec tsx scripts/reset.ts`).
import { runReset } from "../packages/db/src/reset";

runReset().catch((err: unknown) => {
  console.error("[reset] failed:", err);
  process.exit(1);
});
