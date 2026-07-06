SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help install up down logs migrate seed reset watch smoke e2e

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies from the committed lockfile
	pnpm install --frozen-lockfile

up: ## Bring up the full stack (Postgres+PostGIS + API), migrate, seed
	@test -f .env || cp .env.example .env
	docker compose up -d --build
	@echo "[up] waiting for Postgres to become healthy..."
	@until [ "$$(docker inspect -f '{{.State.Health.Status}}' ridenow-v5-db-1 2>/dev/null)" = "healthy" ]; do sleep 2; done
	pnpm db:migrate
	pnpm db:seed
	@echo "[up] waiting for API /health ..."
	@until curl -fsS http://localhost:3000/health >/dev/null 2>&1; do sleep 2; done
	@echo "[up] stack is up. API: http://localhost:3000/health"
	@echo "[up] run 'make watch' to drive the faked core loop."

down: ## Tear down the stack and volumes
	docker compose down -v

logs: ## Tail API logs
	docker compose logs -f api

migrate: ## Apply DB migrations
	pnpm db:migrate

seed: ## Seed deterministic fixtures
	pnpm db:seed

reset: ## Drop, re-migrate and re-seed the local DB (refuses non-local URLs)
	pnpm db:reset

watch: ## Drive the faked core loop and print the trip-state transitions + ledger
	bash scripts/watch-loop.sh

smoke: ## Bring up the stack and assert GET /health returns 200
	$(MAKE) up
	@code=$$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health); \
		test "$$code" = "200" && echo "[smoke] /health -> 200 OK" || (echo "[smoke] /health -> $$code" && exit 1)

e2e: ## Full local proof: stack up + health 200 + core loop
	$(MAKE) up
	$(MAKE) watch
