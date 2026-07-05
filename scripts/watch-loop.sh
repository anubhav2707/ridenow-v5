#!/usr/bin/env bash
# Watch the FAKED core loop run end-to-end against the running API. Drives the
# trip through every state and prints the ordered transitions plus the resulting
# transparent earnings ledger entry. Requires curl + python3 (both ship on
# macOS and ubuntu-latest).
set -euo pipefail

BASE="${API_BASE_URL:-http://localhost:3000}"
PICKUP='{"lng":-122.4194,"lat":37.7749}'
DROPOFF='{"lng":-122.4094,"lat":37.7849}'

command -v python3 >/dev/null 2>&1 || { echo "python3 is required" >&2; exit 1; }

jq_get() { python3 -c 'import sys,json;print(json.load(sys.stdin)[sys.argv[1]])' "$1"; }

echo "[watch] POST /rides/quote (new -> requested -> quoted)"
quote=$(curl -fsS -X POST "$BASE/rides/quote" \
  -H 'content-type: application/json' \
  -d "{\"pickup\":$PICKUP,\"dropoff\":$DROPOFF}")
ride_id=$(printf '%s' "$quote" | jq_get rideId)

echo "[watch] POST /rides/$ride_id/book (-> booked)"
curl -fsS -X POST "$BASE/rides/$ride_id/book" >/dev/null

echo "[watch] POST /rides/$ride_id/accept (-> accepted, returns trip-start OTP)"
accept=$(curl -fsS -X POST "$BASE/rides/$ride_id/accept")
otp=$(printf '%s' "$accept" | jq_get startOtp)
driver_id=$(printf '%s' "$accept" | jq_get driverId)

echo "[watch] POST /rides/$ride_id/start (OTP $otp -> started)"
curl -fsS -X POST "$BASE/rides/$ride_id/start" \
  -H 'content-type: application/json' \
  -d "{\"otp\":\"$otp\"}" >/dev/null

echo "[watch] POST /rides/$ride_id/complete (-> completed, writes ledger entry)"
completed=$(curl -fsS -X POST "$BASE/rides/$ride_id/complete")

echo "[watch] GET /earnings/$driver_id (transparent take-home ledger)"
ledger=$(curl -fsS "$BASE/earnings/$driver_id")

printf '%s' "$completed" | python3 - "$ledger" <<'PY'
import sys, json
completed = json.load(sys.stdin)
ledger = json.loads(sys.argv[1])

print("\n=== trip-state transitions ===")
print("  " + " -> ".join(completed["history"]))

e = completed["ledgerEntry"]
print("\n=== earnings ledger entry ===")
print(f"  driver     {e['driverId']}")
print(f"  ride       {e['rideId']}")
print(f"  gross      {e['gross']['amount']} {e['gross']['currency']} (minor units)")
print(f"  commission {e['commission']['amount']} ({e['commissionBps']} bps)")
print(f"  take-home  {e['netTakeHome']['amount']} {e['netTakeHome']['currency']}")
assert e["commission"]["amount"] + e["netTakeHome"]["amount"] == e["gross"]["amount"], "ledger must sum to gross"
print(f"\n  driver ledger now holds {len(ledger)} entr" + ("y" if len(ledger) == 1 else "ies"))
print("\n[watch] OK — faked core loop completed end-to-end.")
PY
