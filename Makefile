# RideNow v5 — one-command local stack.
.PHONY: up down logs migrate seed reset demo smoke

## up: build + start Postgres+PostGIS and the API, wait for health, then migrate + seed.
up:
	docker compose up -d --build
	@echo "[make] waiting for API /health to return 200..."
	@for i in $$(seq 1 60); do \
	  if curl -fsS http://localhost:3000/health >/dev/null 2>&1; then echo "[make] API healthy"; break; fi; \
	  sleep 2; \
	done
	docker compose exec -T api pnpm --filter @ridenow/db run migrate
	docker compose exec -T api pnpm --filter @ridenow/db run seed
	@echo "[make] stack is up — run 'make demo' to watch the faked core loop"

## migrate: apply pending SQL migrations inside the API container.
migrate:
	docker compose exec -T api pnpm --filter @ridenow/db run migrate

## seed: seed deterministic fixtures inside the API container.
seed:
	docker compose exec -T api pnpm --filter @ridenow/db run seed

## reset: drop + re-migrate + re-seed the local DB (refuses non-local DATABASE_URL).
reset:
	docker compose exec -T api pnpm --filter @ridenow/db run reset

## demo: curl the faked core loop and print the trip-state transitions + ledger.
demo:
	BASE_URL=http://localhost:3000 bash scripts/watch-loop.sh

## smoke: full compose-up + health + core-loop check (used by CI).
smoke:
	bash scripts/smoke.sh

## down: stop the stack and remove volumes.
down:
	docker compose down -v

## logs: tail all container logs.
logs:
	docker compose logs -f
