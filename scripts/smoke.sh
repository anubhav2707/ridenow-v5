#!/usr/bin/env bash
# End-to-end proof the full stack comes up: compose up, wait for /health == 200,
# migrate + seed, then exercise the faked core loop. Used by CI and `make smoke`.
set -euo pipefail

cleanup() {
  docker compose logs || true
  docker compose down -v || true
}
trap cleanup EXIT

docker compose up -d --build

echo "==> waiting for /health to return 200"
code=000
for _ in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health || true)"
  if [ "$code" = "200" ]; then
    echo "health OK (200)"
    break
  fi
  sleep 2
done

if [ "$code" != "200" ]; then
  echo "FAILED: /health never returned 200 (last: $code)" >&2
  exit 1
fi

docker compose exec -T api pnpm --filter @ridenow/db run migrate
docker compose exec -T api pnpm --filter @ridenow/db run seed

echo "==> exercising the faked core loop"
BASE_URL=http://localhost:3000 bash scripts/watch-loop.sh

echo "==> smoke passed"
