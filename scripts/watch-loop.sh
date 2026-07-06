#!/usr/bin/env bash
# Drive the FAKED core loop through the running API and print the ordered
# trip-state transitions and the resulting earnings ledger entry.
set -euo pipefail

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

echo "[watch-loop] POST ${BASE_URL}/core-loop/run"
RESPONSE="$(curl -fsS -X POST "${BASE_URL}/core-loop/run" -H 'content-type: application/json')"

if command -v jq >/dev/null 2>&1; then
  echo "[watch-loop] trip-state transitions:"
  echo "${RESPONSE}" | jq -r '.transitions | join(" -> ")'
  echo "[watch-loop] earnings ledger entry:"
  echo "${RESPONSE}" | jq '.ledgerEntry'
else
  # jq not installed — print the raw payload (still shows transitions + ledger).
  echo "${RESPONSE}"
fi
