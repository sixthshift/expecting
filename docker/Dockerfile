# expecting — one container, SQLite on a volume.
#
# Built from the repo root: `docker build -f docker/Dockerfile .`. The build
# context's ignore file is Dockerfile.dockerignore beside this file. GitHub
# Actions (.github/workflows/docker.yml) builds and publishes it to ghcr.io on
# every push to main; docker-compose.yml here pulls that image.
#
# Bun is pinned to the same version as .devcontainer/Dockerfile; the tag must
# be Bun 1.4 or newer (1.3.x cannot parse the built server — found on garnish).

# --- Stage 1: install and build -------------------------------------------
FROM oven/bun:1.4.2 AS build
WORKDIR /app

# Dependencies first so the install layer is cached while source changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# The commit this image is built from, for the build to inline beside the
# version (src/lib/version.ts): the context has no .git, so the workflow hands
# it over. Declared after the install so a new commit keeps that layer cached.
ARG EXPECTING_COMMIT=""
ENV EXPECTING_COMMIT=$EXPECTING_COMMIT
# `build` sets NODE_ENV=production itself.
RUN bun run build

# --- Stage 2: runtime ------------------------------------------------------
# `-slim` is Debian slim plus Bun: bun:sqlite is built into the binary and
# .output bundles every dependency, so nothing else is needed at runtime.
FROM oven/bun:1.4.2-slim
WORKDIR /app

COPY --from=build /app/.output ./.output

# Boot (src/server.ts) creates DATA_DIR and migrates before the first request,
# so migrations run on every start; no separate step is needed.
# HOST=0.0.0.0 so the Nitro bun preset listens beyond the container loopback.
ENV DATA_DIR=/data \
    NODE_ENV=production \
    PORT=9966 \
    HOST=0.0.0.0

# expecting.db lives here. Runs as root so a bind-mounted host directory works
# without ownership setup.
VOLUME /data
EXPOSE 9966

# The slim image has no curl; Bun's own fetch probes the liveness route.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 9966) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["bun", "run", ".output/server/index.mjs"]
