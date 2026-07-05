# RideNow v5 — one-command local lifecycle.
# `make up` is the single command that brings up Postgres+PostGIS and the API,
# applies migrations + seed (via the API container entrypoint), and waits for a
# healthy readiness check. Then `make watch` exercises the faked core loop.

COMPOSE ?= docker compose
API_BASE_URL ?= http://localhost:3000

.PHONY: up down watch logs reset seed migrate smoke help

help:
	@echo "make up      - build + start db + api, wait for /health"
	@echo "make watch   - drive the faked core loop and print the trip-state transitions"
	@echo "make down    - stop the stack and remove volumes"
	@echo "make logs    - follow container logs"
	@echo "make reset   - drop, re-migrate and re-seed the local DB (refuses non-local)"
	@echo "make smoke   - up + watch (the full local e2e proof)"

up:
	$(COMPOSE) up --build -d
	@echo "[make] waiting for the API to become healthy..."
	@n=0; until curl -fsS $(API_BASE_URL)/health >/dev/null 2>&1; do \
		n=$$((n+1)); \
		if [ $$n -ge 60 ]; then echo "[make] API did not become healthy in time"; $(COMPOSE) logs api; exit 1; fi; \
		sleep 2; \
	done
	@echo "[make] API is healthy at $(API_BASE_URL)/health"
	@echo "[make] next: run 'make watch' to exercise the faked core loop"

watch:
	API_BASE_URL=$(API_BASE_URL) bash scripts/watch-loop.sh

smoke: up watch

logs:
	$(COMPOSE) logs -f

down:
	$(COMPOSE) down -v

reset:
	pnpm db:reset

seed:
	pnpm db:seed

migrate:
	pnpm db:migrate
