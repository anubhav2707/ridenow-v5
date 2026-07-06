# Build + run the RideNow API. Build context is the REPO ROOT (see docker-compose.yml
# / fly.toml) so the whole pnpm workspace + committed lockfile are available.
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ridenow/shared-types --filter @ridenow/db --filter @ridenow/api run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
