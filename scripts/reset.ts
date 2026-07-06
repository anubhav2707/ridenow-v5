// Thin wrapper so the documented `scripts/reset.ts` entrypoint drives the
// canonical reset implemented in @ridenow/db (which refuses non-local URLs).
import { runReset } from "@ridenow/db";

runReset().catch((err) => {
  console.error("[reset] failed:", err);
  process.exit(1);
});
