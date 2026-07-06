#!/usr/bin/env bash
# Watch the faked core loop end-to-end: prints the ordered trip-state transitions
# new -> requested -> quoted -> booked -> accepted -> started -> completed and the
# resulting earnings ledger entry. Requires the stack to be up (`make up`).
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "==> GET ${BASE_URL}/health"
curl -fsS "${BASE_URL}/health"
echo
echo

echo "==> GET ${BASE_URL}/loop/watch"
curl -fsS "${BASE_URL}/loop/watch"
