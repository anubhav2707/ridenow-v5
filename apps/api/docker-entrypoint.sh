#!/bin/sh
# Apply migrations (retrying until Postgres is reachable), seed, then start.
set -e

echo "[entrypoint] applying migrations..."
n=0
until pnpm --filter @ridenow/db migrate; do
  n=$((n + 1))
  if [ "$n" -ge 15 ]; then
    echo "[entrypoint] migrate failed after $n attempts — giving up"
    exit 1
  fi
  echo "[entrypoint] database not ready yet, retry $n/15..."
  sleep 2
done

echo "[entrypoint] seeding deterministic fixtures..."
pnpm --filter @ridenow/db seed

echo "[entrypoint] starting RideNow API..."
exec node apps/api/dist/main.js
