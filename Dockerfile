#######################################
# Build stage
#######################################
FROM node:20.19 AS builder

WORKDIR /app

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PNPM_STORE_DIR="/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && pnpm config set store-dir "$PNPM_STORE_DIR"

# Install package dependencies (cache first)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile

# copy remaining files
COPY . .

# Copy commercial fonts
RUN scripts/build-deps.sh

# build app
RUN pnpm run build
RUN pnpm prune --prod

#######################################
# Serve stage
#######################################
FROM node:20.19-slim

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts/server.js ./scripts/server.js

EXPOSE 3000

# See if increase libuv thread pool size makes performance better
# The default value 4
# http://docs.libuv.org/en/v1.x/threadpool.html
ENV UV_THREADPOOL_SIZE=32

CMD ["node", "scripts/server.js"]
