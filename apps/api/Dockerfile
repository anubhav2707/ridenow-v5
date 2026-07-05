# RideNow API image. Builds the workspace deps + api, then on start applies
# migrations/seed and boots the Fastify server. Sized for localhost, not prod.
FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /app

# Install with the committed lockfile using only manifests first (layer cache).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/config/package.json packages/config/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
COPY apps/rider-web/package.json apps/rider-web/
COPY apps/driver-web/package.json apps/driver-web/
RUN pnpm install --frozen-lockfile

# Copy sources and build the api and the packages it depends on.
COPY . .
RUN pnpm --filter @ridenow/shared-types build \
  && pnpm --filter @ridenow/db build \
  && pnpm --filter @ridenow/api build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["sh", "apps/api/docker-entrypoint.sh"]
