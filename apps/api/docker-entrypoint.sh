#!/usr/bin/env bash
# API container entrypoint: apply migrations + seed, then start the server.
# Idempotent — safe to run on every container start.
set -euo pipefail

echo "[entrypoint] applying migrations"
pnpm --filter @ridenow/db migrate

echo "[entrypoint] seeding deterministic fixtures"
pnpm --filter @ridenow/db seed

echo "[entrypoint] starting API"
exec node apps/api/dist/main.js
