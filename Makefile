# RideNow v5 — one-command local stack.
SHELL := /usr/bin/env bash
.PHONY: help up down logs watch demo reset seed migrate install build lint typecheck test manifest

help:
	@echo "RideNow v5 — targets:"
	@echo "  make up         bring up Postgres+PostGIS + API (migrates + seeds), wait for /health"
	@echo "  make watch      run the faked core loop and print the trip-state transitions + ledger"
	@echo "  make demo       up + watch (the whole loop in one shot)"
	@echo "  make down       tear the stack down and remove volumes"
	@echo "  make logs       follow container logs"
	@echo "  make reset      drop + re-migrate + re-seed the local DB (local-only guard)"
	@echo "  make install/build/lint/typecheck/test/manifest   dev tasks"

up:
	docker compose up --build -d
	bash scripts/wait-for-health.sh
	@echo "RideNow is up → API http://localhost:3000/health  |  run 'make watch' to see the loop"

down:
	docker compose down -v

logs:
	docker compose logs -f

watch:
	bash scripts/watch-loop.sh

demo: up watch

reset:
	pnpm --filter @ridenow/db build
	pnpm db:reset

seed:
	pnpm --filter @ridenow/db seed

migrate:
	pnpm --filter @ridenow/db migrate

install:
	pnpm install --frozen-lockfile

build:
	pnpm build

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

manifest:
	pnpm manifest:check
