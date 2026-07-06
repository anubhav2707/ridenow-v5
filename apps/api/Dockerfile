# RideNow API image. Build context is the REPO ROOT (needs the pnpm workspace
# + shared packages), so run: docker build -f apps/api/Dockerfile .
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo

# --- deps + build -----------------------------------------------------------
FROM base AS build
# Copy manifests first for a cached install layer.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/config/package.json packages/config/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile
# Copy sources and build the api + the packages it depends on.
COPY packages/config packages/config
COPY packages/shared-types packages/shared-types
COPY packages/db packages/db
COPY apps/api apps/api
RUN pnpm --filter @ridenow/api... build

# --- runtime ----------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
EXPOSE 3000
ENTRYPOINT ["bash", "/repo/apps/api/docker-entrypoint.sh"]
