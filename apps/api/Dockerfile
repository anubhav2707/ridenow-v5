# RideNow API image. Build context is the REPO ROOT (see docker-compose.yml)
# so the pnpm workspace + local packages are available.
# syntax=docker/dockerfile:1

FROM node:20-slim AS build
WORKDIR /app
RUN corepack enable
# Manifests first for better layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ridenow/shared-types build \
  && pnpm --filter @ridenow/db build \
  && pnpm --filter @ridenow/api build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Copy the fully-installed + built workspace from the build stage.
COPY --from=build /app ./
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
